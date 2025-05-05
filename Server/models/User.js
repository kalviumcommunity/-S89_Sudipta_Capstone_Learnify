const mongoose = require('mongoose');
const User = require('../Models/user');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

module.exports = mongoose.model('User', userSchema);
