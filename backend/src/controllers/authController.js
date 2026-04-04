/**
 * Auth Controller
 * Handles authentication logic (register, login, password reset)
 */

const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'tutor' ? 'tutor' : 'student'
    });

    // FIX: Generate and hash verification token properly
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${rawToken}`;
    console.log(`Verification URL: ${verifyUrl}`);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: user.getProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name
    };

    if (req.user.role === 'tutor' && req.body.tutorProfile) {
      fieldsToUpdate.tutorProfile = req.body.tutorProfile;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: user.getProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  // FIX: find user first, then use user._id in error handler (not email string)
  let user;
  try {
    user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('No user with that email', 404));
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    console.log(`Password Reset URL: ${resetUrl}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent'
    });
  } catch (error) {
    // FIX: use user._id instead of email string
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      });
    }
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/resetpassword/:resetToken
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired reset token', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email address
 * @route   GET /api/auth/verify/:verificationToken
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    // FIX: hash the incoming token to match what's stored
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.verificationToken)
      .digest('hex');

    const user = await User.findOne({ verificationToken: hashedToken }).select('+verificationToken');

    if (!user) {
      return next(new ErrorResponse('Invalid verification token', 400));
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: send JWT token response
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user.getProfile()
  });
};
