/**
 * Admin Controller
 * Handles admin-only operations
 */

const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Payment = require('../models/Payment');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res, next) => {
  try {
    const [userCount, questionCount, answerCount, paymentTotal] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users: userCount,
        questions: questionCount,
        answers: answerCount,
        totalEarnings: paymentTotal[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, verified, approvalStatus, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (verified !== undefined) query.verified = verified === 'true';
    if (approvalStatus) query['tutorProfile.approvalStatus'] = approvalStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 });

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
 * @desc    Approve or reject tutor
 * @route   PUT /api/admin/tutors/:id/approve
 * @access  Private/Admin
 */
exports.approveTutor = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Status must be approved or rejected', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.role !== 'tutor') {
      return next(new ErrorResponse('User is not a tutor', 400));
    }

    user.tutorProfile.approvalStatus = status;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `Tutor ${status} successfully`,
      data: user.getProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['student', 'tutor', 'admin'].includes(role)) {
      return next(new ErrorResponse('Invalid role', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User role updated',
      data: user.getProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
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

/**
 * @desc    Get all questions (Admin)
 * @route   GET /api/admin/questions
 * @access  Private/Admin
 */
exports.getAllQuestions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const questions = await Question.find(query)
      .populate('studentId', 'name email')
      .populate('assignedTutor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all answers (Admin)
 * @route   GET /api/admin/answers
 * @access  Private/Admin
 */
exports.getAllAnswers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const answers = await Answer.find(query)
      .populate('questionId', 'title')
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: answers.length,
      data: answers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all answers (Admin)
 * @route   GET /api/admin/answers
 * @access  Private/Admin
 */
exports.getAllAnswers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const answers = await Answer.find(query)
      .populate('questionId', 'title')
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: answers.length,
      data: answers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payments (Admin)
 * @route   GET /api/admin/payments
 * @access  Private/Admin
 */
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('questionId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};
