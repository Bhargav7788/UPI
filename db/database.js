const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/upi.sqlite',
  logging: false,
});

// ✅ Don't import model here — just connectDB
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite connected successfully!');
  } catch (error) {
    console.error('❌ SQLite connection failed:', error);
  }
};

module.exports = { sequelize, connectDB };
