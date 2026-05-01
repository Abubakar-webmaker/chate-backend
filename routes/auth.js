const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.error('❌ Register Error: All fields are required');
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (username.length < 3) {
      console.error('❌ Register Error: Username too short');
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error('❌ Register Error: Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
      console.error('❌ Register Error: Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.error(`❌ Register Error: Email already registered — ${email}`);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.error(`❌ Register Error: Username already taken — ${username}`);
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    console.log(`✅ Register Success: ${username} (${email})`);
    res.status(201).json({ message: 'User registered successfully ✅' });

  } catch (error) {
    console.error('❌ Register Server Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.error('❌ Login Error: All fields are required');
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ Login Error: User not found — ${email}`);
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(`❌ Login Error: Wrong password — ${email}`);
      return res.status(400).json({ message: 'Wrong password' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Login Success: ${user.username} (${email})`);
    res.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error('❌ Login Server Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;