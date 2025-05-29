const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

//
// ✅ Middleware to verify JWT token
//
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'jwt_secret_key_simupi');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT error:', err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

//
// ✅ SEND MONEY
//
router.post('/send', verifyToken, async (req, res) => {
  const { toUpiId, amount } = req.body;
  const fromUpiId = req.user.upiId;

  if (!toUpiId || !amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Valid UPI ID and amount are required' });
  }

  try {
    const sender = await User.findOne({ where: { upiId: fromUpiId } });
    const receiver = await User.findOne({ where: { upiId: toUpiId } });

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    sender.balance -= amount;
    receiver.balance += Number(amount);

    await sender.save();
    await receiver.save();

    // ✅ Log transaction for both users
    await Transaction.create({
      fromUpiId,
      toUpiId,
      amount,
      type: 'sent'
    });

    await Transaction.create({
      fromUpiId: toUpiId,
      toUpiId: fromUpiId,
      amount,
      type: 'received'
    });

    res.status(200).json({
      message: `₹${amount} sent successfully to ${receiver.name}`,
      senderBalance: sender.balance,
      receiverUpiId: receiver.upiId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Transaction failed' });
  }
});

//
// ✅ BALANCE CHECK
//
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      upiId: user.upiId,
      balance: user.balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch balance' });
  }
});

//
// ✅ TRANSACTION HISTORY
//
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const userUpiId = req.user.upiId;

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { fromUpiId: userUpiId },
          { toUpiId: userUpiId }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

//
// ✅ GET UPI ID by Email (Case-insensitive + debug)
//
router.post('/get-upi-id', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const allUsers = await User.findAll();
    console.log("✅ All Registered Users:");
    allUsers.forEach(u => console.log(`- ${u.email} | ${u.upiId}`));

    const user = await User.findOne({
      where: {
        email: {
          [Op.eq]: email.toLowerCase()
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      upiId: user.upiId,
      name: user.name
    });
  } catch (err) {
    console.error("❌ Error in /get-upi-id:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
