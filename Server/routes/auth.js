const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Forgot Password
router.post('/forgot-password', authController.forgotPassword);

// Reset Password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
