/**
 * User Model
 * Defines the schema for all users (students, tutors, admins)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    default: 'student'
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },

  // FIX: wrap tutorProfile in type + default so approvalStatus
  // is always initialized when any user registers
  tutorProfile: {
    type: {
      expertise: [{
        type: String,
        trim: true
      }],
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
      },
      approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      earnings: {
        type: Number,
        default: 0
      }
    },
    default: () => ({
      approvalStatus: 'pending',
      expertise: [],
      earnings: 0
    })
  }

}, {
  timestamps: true
});

// Use modern async pre-save hook without next parameter
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user profile (safe to expose)
userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    verified: this.verified,
    tutorProfile: this.role === 'tutor' ? this.tutorProfile : undefined,
    createdAt: this.createdAt
  };
};

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d' }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
