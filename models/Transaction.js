const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const Transaction = sequelize.define('Transaction', {
  fromUpiId: { type: DataTypes.STRING, allowNull: false },
  toUpiId: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('sent', 'received'), allowNull: false }
});

module.exports = Transaction;
