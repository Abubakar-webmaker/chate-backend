const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user');
app.use('/api', userRoutes);

const messageRoutes = require('./routes/message');
app.use('/api', messageRoutes);

app.get('/', (req, res) => {
  res.send('Chat App Backend Running ✅');
});

const Message = require('./models/Message');
const User = require('./models/User');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User online mark karo
  socket.on('userOnline', async (userId) => {
    await User.findByIdAndUpdate(userId, { isOnline: true });
    socket.userId = userId;
    io.emit('userStatusChanged', { userId, isOnline: true });
  });

  // One-to-one message
  socket.on('privateMessage', async ({ senderId, receiverId, message }) => {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
      isGroupMessage: false
    });
    await newMessage.save();

    io.emit('privateMessage', {
      senderId,
      receiverId,
      message,
      createdAt: newMessage.createdAt
    });
  });

  // Group chat join
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Group message
  socket.on('groupMessage', async ({ senderId, room, message }) => {
    const newMessage = new Message({
      sender: senderId,
      room,
      message,
      isGroupMessage: true
    });
    await newMessage.save();

    io.to(room).emit('groupMessage', {
      senderId,
      room,
      message,
      createdAt: newMessage.createdAt
    });
  });

  // User offline mark karo
  socket.on('disconnect', async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { isOnline: false });
      io.emit('userStatusChanged', { userId: socket.userId, isOnline: false });
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});