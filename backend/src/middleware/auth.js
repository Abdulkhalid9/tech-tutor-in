/**
 * Auth Middleware
 * Verifies JWT token and attaches user to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Protect routes - verify JWT token
 */
const auth = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return next(new ErrorResponse('User not found', 401));
      }

      next();
    } catch (error) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = auth;

