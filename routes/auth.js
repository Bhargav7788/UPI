const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
router.get('/test', (req, res) => {
    res.send('✅ Auth routes are working!');
  });
  
// Debug
console.log('✅ authRoutes.js loaded');

// Utility to generate UPI ID
const generateUpiId = (name) => {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${name.toLowerCase()}${randomNum}@simupi`;
};

//
// ✅ SIGNUP ROUTE
//
router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const upiId = generateUpiId(name);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      upiId,
      balance: 10000
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        upiId: newUser.upiId,
        balance: newUser.balance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});


//
// ✅ LOGIN ROUTE
//
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        upiId: user.upiId
      },
      'jwt_secret_key_simupi',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        upiId: user.upiId,
        balance: user.balance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
