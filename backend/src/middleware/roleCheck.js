/**
 * Role-Based Access Control Middleware
 * Restricts access based on user roles
 */

const ErrorResponse = require('../utils/errorResponse');

/**
 * Create middleware that allows specified roles
 * @param {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

module.exports = roleCheck;
