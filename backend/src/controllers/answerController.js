/**
 * Answer Controller
 * Handles answer-related operations
 */

const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Submit an answer
 * @route   POST /api/answers
 * @access  Private/Tutor
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, solution, file, fileType } = req.body;

    // Find the question
    const question = await Question.findById(questionId);

    if (!question) {
      return next(new ErrorResponse('Question not found', 404));
    }

    // Check if tutor is assigned to this question
    if (question.assignedTutor?.toString() !== req.user.id) {
      return next(new ErrorResponse('You are not assigned to this question', 403));
    }

    // Check if question is in assigned status
    if (question.status !== 'assigned') {
      return next(new ErrorResponse('Question is not ready for answer', 400));
    }

    // Check if answer already exists
    const existingAnswer = await Answer.findOne({ questionId });
    if (existingAnswer) {
      return next(new ErrorResponse('Answer already submitted for this question', 400));
    }

    // Create answer
    const answer = await Answer.create({
      questionId,
      tutorId: req.user.id,
      solution,
      file: file || null,
      fileType: fileType || null,
      amountEarned: question.price
    });

    // Update question status
    question.status = 'answered';
    await question.save();

    res.status(201).json({
      status: 'success',
      message: 'Answer submitted successfully',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get answer for a question
 * @route   GET /api/answers/question/:questionId
 * @access  Private
 */
exports.getAnswerByQuestion = async (req, res, next) => {
  try {
    const answer = await Answer.findOne({ questionId: req.params.questionId })
      .populate('tutorId', 'name email');

    if (!answer) {
      return next(new ErrorResponse('Answer not found', 404));
    }

    // Check access
    const question = await Question.findById(req.params.questionId);
    const isStudent = question.studentId.toString() === req.user.id;
    const isTutor = answer.tutorId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isTutor && !isAdmin) {
      return next(new ErrorResponse('Not authorized to view this answer', 403));
    }

    // If student, they can only view if they've unlocked (paid)
    if (isStudent && !question.answerUnlocked) {
      return next(new ErrorResponse('Please pay to unlock this answer', 403));
    }

    res.status(200).json({
      status: 'success',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all answers by a tutor
 * @route   GET /api/answers/my-answers
 * @access  Private/Tutor
 */
exports.getMyAnswers = async (req, res, next) => {
  try {
    const answers = await Answer.find({ tutorId: req.user.id })
      .populate('questionId', 'title status price subject')
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
 * @desc    Get single answer
 * @route   GET /api/answers/:id
 * @access  Private
 */
exports.getAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('tutorId', 'name email')
      .populate('questionId');

    if (!answer) {
      return next(new ErrorResponse('Answer not found', 404));
    }

    const question = answer.questionId;
    const isStudent = question.studentId.toString() === req.user.id;
    const isTutor = answer.tutorId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isTutor && !isAdmin) {
      return next(new ErrorResponse('Not authorized to view this answer', 403));
    }

    if (isStudent && !question.answerUnlocked) {
      return next(new ErrorResponse('Please pay to unlock this answer', 403));
    }

    res.status(200).json({
      status: 'success',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept answer (student accepts answer)
 * @route   PUT /api/answers/:id/accept
 * @access  Private/Student
 */
exports.acceptAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return next(new ErrorResponse('Answer not found', 404));
    }

    const question = await Question.findById(answer.questionId);

    // Only question owner can accept
    if (question.studentId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to accept this answer', 403));
    }

    if (!question.answerUnlocked) {
      return next(new ErrorResponse('Please complete payment before accepting this answer', 403));
    }

    if (answer.status !== 'submitted') {
      return next(new ErrorResponse('Answer is not in submitted status', 400));
    }

    answer.status = 'accepted';
    await answer.save();

    // Update question status to closed
    question.status = 'closed';
    await question.save();

    // Add earnings to tutor
    const tutor = await User.findById(answer.tutorId);
    tutor.tutorProfile.earnings += answer.amountEarned;
    await tutor.save();

    res.status(200).json({
      status: 'success',
      message: 'Answer accepted successfully',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject answer (student rejects)
 * @route   PUT /api/answers/:id/reject
 * @access  Private/Student
 */
exports.rejectAnswer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return next(new ErrorResponse('Answer not found', 404));
    }

    const question = await Question.findById(answer.questionId);

    // Only question owner can reject
    if (question.studentId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to reject this answer', 403));
    }

    if (!question.answerUnlocked) {
      return next(new ErrorResponse('Please complete payment before rejecting this answer', 403));
    }

    answer.status = 'rejected';
    await answer.save();

    // Reset question to assigned status so tutor can resubmit
    question.status = 'assigned';
    await question.save();

    res.status(200).json({
      status: 'success',
      message: 'Answer rejected. Tutor can submit a new answer.',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};
