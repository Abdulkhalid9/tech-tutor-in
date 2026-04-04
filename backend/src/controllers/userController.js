/**
 * User Controller
 * Handles user profile management
 */

const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-verificationToken -resetPasswordToken');

    res.status(200).json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-verificationToken -resetPasswordToken');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};

    // Allowed fields for update
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;

    // Handle tutor profile updates
    if (req.user.role === 'tutor' && req.body.tutorProfile) {
      const { expertise, bio } = req.body.tutorProfile;
      fieldsToUpdate.tutorProfile = {};

      if (expertise) fieldsToUpdate.tutorProfile.expertise = expertise;
      if (bio) fieldsToUpdate.tutorProfile.bio = bio;
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
 * @desc    Delete user account
 * @route   DELETE /api/users/:id
 * @access  Private (Self or Admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Only allow user to delete themselves or admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this user', 403));
    }

    await user.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
