/**
 * Upload Controller
 * Handles file uploads to Cloudinary or local storage
 */

const cloudinary = require('../config/cloudinary');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Upload file to Cloudinary
 * @route   POST /api/upload
 * @access  Private
 */
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No file uploaded', 400));
    }

    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';

    // If Cloudinary is configured, upload to Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'techtutorin',
        resource_type: fileType === 'pdf' ? 'raw' : 'auto'
      });

      // Delete local file after upload to Cloudinary
      const fs = require('fs');
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        status: 'success',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          fileType: fileType
        }
      });
    } else {
      // No Cloudinary - return local file path
      res.status(200).json({
        status: 'success',
        data: {
          url: `/uploads/${req.file.filename}`,
          publicId: req.file.filename,
          fileType: fileType,
          message: 'Local upload (configure Cloudinary for production)'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload multiple files
 * @route   POST /api/upload/multiple
 * @access  Private
 */
exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse('No files uploaded', 400));
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'pdf';

        if (process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
          
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'techtutorin',
            resource_type: fileType === 'pdf' ? 'raw' : 'auto'
          });

          // Delete local file after upload
          const fs = require('fs');
          fs.unlinkSync(file.path);

          return {
            url: result.secure_url,
            publicId: result.public_id,
            fileType: fileType
          };
        } else {
          return {
            url: `/uploads/${file.filename}`,
            publicId: file.filename,
            fileType: fileType
          };
        }
      })
    );

    res.status(200).json({
      status: 'success',
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete file from Cloudinary
 * @route   DELETE /api/upload/:publicId
 * @access  Private
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
      
      await cloudinary.uploader.destroy(publicId);
    }

    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
