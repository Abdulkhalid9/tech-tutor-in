/**
 * Question Model
 * Defines the schema for student questions
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Question description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  file: {
    type: String, // URL to uploaded image/PDF
    default: null
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', null],
    default: null
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'answered', 'closed'],
    default: 'pending'
  },
  assignedTutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    default: 50
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  // Track if answer has been unlocked by student
  answerUnlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
questionSchema.index({ status: 1, createdAt: -1 });
questionSchema.index({ studentId: 1, createdAt: -1 });
questionSchema.index({ assignedTutor: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
