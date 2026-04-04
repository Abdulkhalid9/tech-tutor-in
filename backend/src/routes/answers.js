const express = require('express');
const router = express.Router();
const {
  submitAnswer,
  getAnswerByQuestion,
  getMyAnswers,
  getAnswer,
  acceptAnswer,
  rejectAnswer
} = require('../controllers/answerController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(protect);

router.post('/', roleCheck('tutor'), submitAnswer);
router.get('/my-answers', roleCheck('tutor'), getMyAnswers);
router.put('/:id/accept', roleCheck('student'), acceptAnswer);
router.put('/:id/reject', roleCheck('student'), rejectAnswer);
router.get('/question/:questionId', getAnswerByQuestion);
router.get('/:id', getAnswer);

module.exports = router;