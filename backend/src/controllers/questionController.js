/**
 * Question Controller
 * Handles question-related operations
 */

const Question = require('../models/Question');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Create a new question
 * @route   POST /api/questions
 * @access  Private/Student
 */
exports.createQuestion = async (req, res, next) => {
  try {
    const { title, description, file, fileType, price, subject } = req.body;

    const question = await Question.create({
      title,
      description,
      file: file || null,
      fileType: fileType || null,
      price: price || 50,
      subject: subject || null,
      studentId: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Question posted successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all questions
 * @route   GET /api/questions
 * @access  Private
 */
exports.getQuestions = async (req, res, next) => {
  try {
    const { status, subject } = req.query;
    const query = {};

    if (req.user.role === 'tutor') {
      query.status = status || 'pending';
    } else if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }

    if (subject) query.subject = subject;

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
 * @desc    Get single question
 * @route   GET /api/questions/:id
 * @access  Private
 */
exports.getQuestion = async (req, res, next) => {
  try {
    // FIX: removed .populate('answers') — answers field doesn't exist in Question schema
    // Answers are fetched separately via /api/answers/question/:id
    const question = await Question.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('assignedTutor', 'name email');

    if (!question) {
      return next(new ErrorResponse('Question not found', 404));
    }

    const isOwner = question.studentId._id.toString() === req.user.id;
    const isAssignedTutor = question.assignedTutor?._id?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAssignedTutor && !isAdmin) {
      return next(new ErrorResponse('Not authorized to view this question', 403));
    }

    res.status(200).json({
      status: 'success',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pending questions (for tutors)
 * @route   GET /api/questions/pending
 * @access  Private/Tutor
 */
exports.getPendingQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ status: 'pending' })
      .populate('studentId', 'name email')
      .sort({ price: -1, createdAt: -1 });

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
 * @desc    Accept a question (tutor accepts)
 * @route   PUT /api/questions/:id/accept
 * @access  Private/Tutor
 */
exports.acceptQuestion = async (req, res, next) => {
  try {
    // Check tutor role and approval first
    if (req.user.role !== 'tutor') {
      return next(new ErrorResponse('Only tutors can accept questions', 403));
    }

    if (req.user.tutorProfile?.approvalStatus !== 'approved') {
      return next(new ErrorResponse('Your tutor account is not approved yet', 403));
    }

    // FIX: Atomic update — only succeeds if question is STILL pending at this exact moment
    // Prevents race condition where multiple tutors accept the same question simultaneously
    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'assigned', assignedTutor: req.user.id },
      { new: true }
    );

    if (!question) {
      return next(new ErrorResponse('Question is no longer available — another tutor may have accepted it', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Question accepted successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update question
 * @route   PUT /api/questions/:id
 * @access  Private/Student (owner only)
 */
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return next(new ErrorResponse('Question not found', 404));
    }

    if (question.studentId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this question', 403));
    }

    if (question.status === 'answered' || question.status === 'closed') {
      return next(new ErrorResponse('Cannot update question after answer is submitted', 400));
    }

    const { title, description, price, subject } = req.body;

    if (title) question.title = title;
    if (description) question.description = description;
    if (price) question.price = price;
    if (subject) question.subject = subject;

    await question.save();

    res.status(200).json({
      status: 'success',
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/questions/:id
 * @access  Private/Student (owner only)
 */
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return next(new ErrorResponse('Question not found', 404));
    }

    if (question.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this question', 403));
    }

    if (question.status === 'answered' || question.status === 'closed') {
      return next(new ErrorResponse('Cannot delete question after answer is submitted', 400));
    }

    await question.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my questions (for current student)
 * @route   GET /api/questions/my
 * @access  Private/Student
 */
exports.getMyQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ studentId: req.user.id })
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
 * @desc    Get questions assigned to me (for tutors)
 * @route   GET /api/questions/my-assigned
 * @access  Private/Tutor
 */
exports.getMyAssignedQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({
      assignedTutor: req.user.id,
      status: { $in: ['assigned', 'answered'] }
    })
      .populate('studentId', 'name email')
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
