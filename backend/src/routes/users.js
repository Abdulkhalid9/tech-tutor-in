const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateProfile,
  deleteUser
} = require('../controllers/userController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(protect);

router.get('/', roleCheck('admin'), getUsers);
router.get('/:id', getUser);
router.put('/profile', updateProfile);
router.delete('/:id', deleteUser);

module.exports = router;