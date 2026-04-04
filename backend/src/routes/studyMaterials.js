const express = require('express');
const router = express.Router();
const {
  createMaterial,
  getMaterials,
  getMaterial,
  updateMaterial,
  deleteMaterial,
  incrementDownload
} = require('../controllers/studyMaterialController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(protect);
router.use(roleCheck('admin'));

router.get('/', getMaterials);
router.get('/:id', getMaterial);
router.put('/:id/download', incrementDownload);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;