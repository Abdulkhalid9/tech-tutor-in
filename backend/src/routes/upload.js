const express = require('express');
const router = express.Router();
const {
  uploadFile,
  uploadMultiple,
  deleteFile
} = require('../controllers/uploadController');
const protect = require('../middleware/auth');
const uploadLocal = require('../config/multer');

router.use(protect);

router.post('/', uploadLocal.single('file'), uploadFile);
router.post('/multiple', uploadLocal.array('files', 5), uploadMultiple);
router.delete('/:publicId', deleteFile);

module.exports = router;