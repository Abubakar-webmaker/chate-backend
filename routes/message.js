const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

// One-to-one chat history
router.get('/messages/:receiverId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.userId }
      ]
    }).populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Group chat history
router.get('/messages/group/:room', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      room: req.params.room,
      isGroupMessage: true
    }).populate('sender', 'username')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;