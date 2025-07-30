const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// POST /api/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'No user with that email.' });

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'resetsecret', { expiresIn: '1h' });
  user.resetToken = token;
  user.tokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send email (dummy)
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  await sendEmail(user.email, 'Password Reset', `Reset your password: ${resetUrl}`);

  res.json({ message: 'Password reset link sent to your email.' });
};

// POST /api/reset-password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and new password required.' });
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'resetsecret');
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
  const user = await User.findOne({ _id: payload.id, resetToken: token, tokenExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

  user.password = password;
  user.resetToken = undefined;
  user.tokenExpires = undefined;
  await user.save();

  res.json({ message: 'Password has been reset. You can now log in.' });
};
