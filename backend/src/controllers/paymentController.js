/**
 * Payment Controller
 * Handles payment operations with Razorpay
 */

const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Question = require('../models/Question');
const ErrorResponse = require('../utils/errorResponse');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret'
});

/**
 * @desc    Create Razorpay order for a question
 * @route   POST /api/payments/create-order
 * @access  Private/Student
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { questionId } = req.body;

    // Find question
    const question = await Question.findById(questionId);

    if (!question) {
      return next(new ErrorResponse('Question not found', 404));
    }

    // Check if student owns this question
    if (question.studentId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to pay for this question', 403));
    }

    // Check if already paid
    if (question.answerUnlocked) {
      return next(new ErrorResponse('Answer already unlocked', 400));
    }

    // Check if question has an answer
    const answer = await Payment.findOne({ questionId, status: 'completed' });
    if (answer) {
      return next(new ErrorResponse('Already paid for this question', 400));
    }

    // Create Razorpay order
    const options = {
      amount: question.price * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `receipt_${questionId}_${Date.now()}`,
      notes: {
        questionId: questionId.toString(),
        studentId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      questionId,
      amount: question.price,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.status(201).json({
      status: 'success',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment signature
 * @route   POST /api/payments/verify
 * @access  Private/Student
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    // Find payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Verify signature
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      return next(new ErrorResponse('Payment verification failed', 400));
    }

    // Update payment status
    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Unlock answer in question
    await Question.findByIdAndUpdate(payment.questionId, { answerUnlocked: true });

    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        status: 'completed'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment status
 * @route   GET /api/payments/:id
 * @access  Private
 */
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('questionId', 'title price status');

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Check access
    if (payment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to view this payment', 403));
    }

    res.status(200).json({
      status: 'success',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my payments
 * @route   GET /api/payments/my
 * @access  Private/Student
 */
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('questionId', 'title price status')
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

/**
 * @desc    Get Razorpay Key (public)
 * @route   GET /api/payments/key
 * @access  Public
 */
exports.getRazorpayKey = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      key: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id'
    }
  });
};
