/**
 * Answer Model
 * Defines the schema for tutor answers
 */

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  solution: {
    type: String,
    required: [true, 'Solution is required'],
    maxlength: [10000, 'Solution cannot exceed 10000 characters']
  },
  file: {
    type: String, // URL to uploaded file (optional)
    default: null
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', 'video', null],
    default: null
  },
  // Price at time of answering (may differ from question price)
  amountEarned: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'accepted', 'rejected'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Index for efficient querying
answerSchema.index({ questionId: 1 });
answerSchema.index({ tutorId: 1 });

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
