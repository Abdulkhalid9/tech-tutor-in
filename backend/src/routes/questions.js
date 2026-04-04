/**
 * Question Routes
 * Handles question-related API endpoints
 */

const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestion,
  getPendingQuestions,
  acceptQuestion,
  updateQuestion,
  deleteQuestion,
  getMyQuestions,
  getMyAssignedQuestions
} = require('../controllers/questionController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(protect);

// FIX: Static/named routes MUST come before /:id routes
// Otherwise Express matches /my, /pending, /my-assigned as /:id

// Student routes
router.post('/', roleCheck('student'), createQuestion);
router.get('/my', roleCheck('student'), getMyQuestions);

// Tutor routes
router.get('/pending', roleCheck('tutor', 'admin'), getPendingQuestions);
router.get('/my-assigned', roleCheck('tutor'), getMyAssignedQuestions);

// Shared routes
router.get('/', getQuestions);

// Dynamic /:id routes LAST — these must come after all static routes
router.get('/:id', getQuestion);
router.put('/:id/accept', roleCheck('tutor'), acceptQuestion);
router.put('/:id', roleCheck('student'), updateQuestion);
router.delete('/:id', roleCheck('student'), deleteQuestion);

module.exports = router;