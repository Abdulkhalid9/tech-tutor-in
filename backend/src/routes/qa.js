// ============================================================
// backend/routes/qaRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Payment = require('../models/Payment'); // your existing Payment model
const protect = require('../middleware/auth');

// ── GET /api/qa ──────────────────────────────────────────────
// Returns all "answered" questions for the Study Materials page.
// Each question includes its answer BUT the frontend blurs it
// unless answerUnlocked === true for that student.
// ─────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    // Only show questions that have been answered
    const questions = await Question.find({ status: 'answered' })
      .sort({ createdAt: -1 })
      .select('title description subject price answerUnlocked file fileType');

    // Fetch corresponding answers
    const questionIds = questions.map((q) => q._id);
    const answers = await Answer.find({ questionId: { $in: questionIds } })
      .select('questionId solution file fileType');

    // Map answers by questionId for quick lookup
    const answerMap = {};
    answers.forEach((a) => {
      answerMap[a.questionId.toString()] = a;
    });

    // Merge question + answer into one object
    const data = questions.map((q) => {
      const answer = answerMap[q._id.toString()];
      return {
        _id: q._id,
        title: q.title,
        description: q.description,
        subject: q.subject,
        price: q.price,
        answerUnlocked: q.answerUnlocked,
        questionFile: q.file,
        questionFileType: q.fileType,
        solution: answer?.solution || null,
        answerFile: answer?.file || null,
        answerFileType: answer?.fileType || null,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ── POST /api/qa/unlock/:questionId ──────────────────────────
// Called after Razorpay payment succeeds on the frontend.
// Verifies payment via Razorpay signature, then flips
// question.answerUnlocked = true for that student.
// ─────────────────────────────────────────────────────────────
const crypto = require('crypto');

router.post('/unlock/:questionId', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // 2. Flip answerUnlocked on the question
    const question = await Question.findByIdAndUpdate(
      req.params.questionId,
      { answerUnlocked: true },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({ success: true, message: 'Answer unlocked', data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ── POST /api/qa/order/:questionId ───────────────────────────
// Creates a Razorpay order for unlocking a specific answer.
// Frontend calls this first, gets order_id, then opens Razorpay.
// ─────────────────────────────────────────────────────────────
// const Razorpay = require('razorpay');

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

router.post('/order/:questionId', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (question.answerUnlocked) {
      return res.status(400).json({ success: false, message: 'Answer already unlocked' });
    }

    const order = await razorpay.orders.create({
      amount: question.price * 100, // paise
      currency: 'INR',
      receipt: `qa_unlock_${question._id}`,
      notes: {
        questionId: question._id.toString(),
        studentId: req.user._id.toString(),
      },
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;