const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./db/database');
const User = require('./models/User'); // User model
const Transaction = require('./models/Transaction'); // ✅ Transaction model
const authRoutes = require('./routes/auth'); // ✅ Login & Signup Routes
const sendRoutes = require('./routes/sendRoutes'); // ✅ Send/Balance/History Routes

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ✅ Mount routes
app.use('/api/auth', authRoutes);
app.use('/api', sendRoutes); // /api/send, /api/balance, /api/transactions

// Health check route
app.get('/', (req, res) => {
  res.send('✅ SimUPI Backend running on port 8899 with SQLite!');
});

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// Connect to DB and start server
connectDB().then(async () => {
  await User.sync({ alter: true });
  await Transaction.sync({ alter: true }); // ✅ Sync Transaction table

  const PORT = process.env.PORT || 8899;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
