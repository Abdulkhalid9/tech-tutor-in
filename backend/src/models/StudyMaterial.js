/**
 * Study Material Model
 * Defines the schema for study materials uploaded by admin
 */

const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  file: {
    type: String, // URL to file
    required: [true, 'File is required']
  },
  fileType: {
    type: String,
    enum: ['pdf', 'video', 'image', 'document'],
    required: true
  },
  fileSize: {
    type: Number // in bytes
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
studyMaterialSchema.index({ subject: 1, isActive: 1 });
studyMaterialSchema.index({ createdAt: -1 });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

module.exports = StudyMaterial;
