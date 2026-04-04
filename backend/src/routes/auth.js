/**
 * Authentication Routes
 * Handles user authentication endpoints
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules
} = require('../utils/validators');
const validate = require('../middleware/validate');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/forgotpassword', forgotPasswordRules, validate, forgotPassword);
router.post('/resetpassword/:resetToken', resetPasswordRules, validate, resetPassword);
router.get('/verify/:verificationToken', verifyEmail);

// Protected routes (require authentication)
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

module.exports = router;
