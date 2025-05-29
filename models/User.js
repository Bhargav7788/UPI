const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database'); // ✅ This imports the working Sequelize instance

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  upiId: {
    type: DataTypes.STRING,
    unique: true
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 10000
  }
}, {
  timestamps: true
});

module.exports = User;
