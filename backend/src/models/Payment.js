/**
 * Payment Model
 * Defines the schema for payments
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    unique: true,  // this already creates the index — no need for schema.index() below
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  razorpaySignature: {
    type: String,
    select: false
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  }
}, {
  timestamps: true
});

// Index for efficient querying
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ questionId: 1 });
// REMOVED: paymentSchema.index({ razorpayOrderId: 1 }) — duplicate of unique: true above

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;