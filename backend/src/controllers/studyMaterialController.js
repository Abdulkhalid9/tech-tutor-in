/**
 * Study Material Controller
 * Handles study material operations
 */

const StudyMaterial = require('../models/StudyMaterial');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Create study material
 * @route   POST /api/materials
 * @access  Private/Admin
 */
exports.createMaterial = async (req, res, next) => {
  try {
    const { title, description, subject, file, fileType, fileSize } = req.body;

    const material = await StudyMaterial.create({
      title,
      description,
      subject,
      file,
      fileType,
      fileSize,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Study material uploaded successfully',
      data: material
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all study materials
 * @route   GET /api/materials
 * @access  Public
 */
exports.getMaterials = async (req, res, next) => {
  try {
    const { subject, search } = req.query;
    const query = { isActive: true };

    if (subject) query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const materials = await StudyMaterial.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: materials.length,
      data: materials
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single study material
 * @route   GET /api/materials/:id
 * @access  Public
 */
exports.getMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id)
      .populate('uploadedBy', 'name');

    if (!material) {
      return next(new ErrorResponse('Study material not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: material
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update study material
 * @route   PUT /api/materials/:id
 * @access  Private/Admin
 */
exports.updateMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return next(new ErrorResponse('Study material not found', 404));
    }

    const { title, description, subject, isActive } = req.body;

    if (title) material.title = title;
    if (description) material.description = description;
    if (subject) material.subject = subject;
    if (isActive !== undefined) material.isActive = isActive;

    await material.save();

    res.status(200).json({
      status: 'success',
      message: 'Study material updated successfully',
      data: material
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete study material
 * @route   DELETE /api/materials/:id
 * @access  Private/Admin
 */
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return next(new ErrorResponse('Study material not found', 404));
    }

    // Soft delete - set inactive
    material.isActive = false;
    await material.save();

    res.status(200).json({
      status: 'success',
      message: 'Study material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Increment download count
 * @route   PUT /api/materials/:id/download
 * @access  Public
 */
exports.incrementDownload = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!material) {
      return next(new ErrorResponse('Study material not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { downloadCount: material.downloadCount }
    });
  } catch (error) {
    next(error);
  }
};
