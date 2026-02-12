
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

// Reusable path formatter – type + userId + date + random + ext
const formatFileName = (req, file, type) => {
  const userId = req.user?.id || 'unknown';
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const ext = path.extname(file.originalname).toLowerCase();
  return `${type}_${userId}_${date}_${random}${ext}`;
};

// Reusable storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    if (file.fieldname === 'profileImage') folder = 'uploads/UserProfiles';
    else if (file.fieldname === 'turfImages') folder = 'uploads/TurfImages';
    else if (file.fieldname === 'turfVideos') folder = 'uploads/TurfVideos';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const type = file.fieldname; // profileImage, turfImages, turfVideos, etc.
    const name = formatFileName(req, file, type);
    cb(null, name);
  },
});

// File type filters with separate messages
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG or PNG images are allowed'), false);
  }
};

const videoFilter = (req, file, cb) => {
  const allowed = /mp4|avi/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4 or AVI videos are allowed'), false);
  }
};

// Reusable upload function – accepts MB limits (defaults if not provided)
export const uploadFile = (fieldName, options = {}) => {
  // Defaults in MB
  const defaultImageMaxMB = 5;
  const defaultVideoMaxMB = 50;

  // Convert MB to bytes
  const imageMaxSizeBytes = (options.imageMaxMB || defaultImageMaxMB) * 1024 * 1024;
  const videoMaxSizeBytes = (options.videoMaxMB || defaultVideoMaxMB) * 1024 * 1024;

  return multer({
    storage,
    limits: { fileSize: Math.max(imageMaxSizeBytes, videoMaxSizeBytes) },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'profileImage' || file.fieldname === 'turfImages') {
        imageFilter(req, file, cb);
      } else if (file.fieldname === 'turfVideos') {
        videoFilter(req, file, cb);
      } else {
        cb(new Error('Invalid field name'), false);
      }
    },
  }).single(fieldName); // Change to .array() or .fields() for multiple files later
};

// Post-upload handler – delete on failure (transaction-like)
export const processUpload = async (req, res, next) => {
  try {
    // Success → continue to controller
    next();
  } catch (error) {
    // Delete uploaded file if any failure
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    // Clear & specific messages
    if (error.message.includes('Only JPG') || error.message.includes('Only MP4')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      let limitMsg = 'File size exceeded. ';
      if (req.file?.fieldname.includes('Image')) {
        limitMsg += `Maximum allowed size for images is ${defaultImageMaxMB} MB.`;
      } else if (req.file?.fieldname.includes('Video')) {
        limitMsg += `Maximum allowed size for videos is ${defaultVideoMaxMB} MB.`;
      } else {
        limitMsg += 'Please check file size.';
      }
      return res.status(400).json({ success: false, message: limitMsg });
    }

    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};