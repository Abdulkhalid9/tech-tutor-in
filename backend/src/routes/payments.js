const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPayment,
  getMyPayments,
  getRazorpayKey
} = require('../controllers/paymentController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/key', getRazorpayKey);

router.use(protect);

router.post('/create-order', roleCheck('student'), createOrder);
router.post('/verify', roleCheck('student'), verifyPayment);
router.get('/my', roleCheck('student'), getMyPayments);
router.get('/:id', getPayment);

module.exports = router;