import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

const formatFileName = (req, file, type) => {
  const userId = req.user?.id || 'unknown';
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const ext = path.extname(file.originalname).toLowerCase();
  return `${type}_${userId}_${date}_${random}${ext}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';

    // User files – completely separate
    if (file.fieldname === 'profileImage') {
      folder = 'uploads/users/profiles';
    }

    // Turf files – completely separate folder structure
    if (file.fieldname === 'images' || file.fieldname === 'coverImage' || file.fieldname === 'turfImages') {
      folder = 'uploads/turfs/images';
    }

    if (file.fieldname === 'videos' || file.fieldname === 'turfVideos') {
      folder = 'uploads/turfs/videos';
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const type = file.fieldname;
    const name = formatFileName(req, file, type);
    cb(null, name);
  },
});

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
  const allowed = /mp4|mov|avi/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4, MOV or AVI videos are allowed'), false);
  }
};

export const uploadFile = (fieldName, options = {}) => {
  const defaultImageMaxMB = 5;
  const defaultVideoMaxMB = 100;

  const imageMaxSizeBytes = (options.imageMaxMB || defaultImageMaxMB) * 1024 * 1024;
  const videoMaxSizeBytes = (options.videoMaxMB || defaultVideoMaxMB) * 1024 * 1024;

  return multer({
    storage,
    limits: { fileSize: Math.max(imageMaxSizeBytes, videoMaxSizeBytes) },
    fileFilter: (req, file, cb) => {
      if (['profileImage', 'images', 'coverImage', 'turfImages'].includes(file.fieldname)) {
        imageFilter(req, file, cb);
      } else if (['videos', 'turfVideos'].includes(file.fieldname)) {
        videoFilter(req, file, cb);
      } else {
        cb(new Error('Invalid field name'), false);
      }
    },
  }).single(fieldName);
};

export const uploadTurfMedia = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['images', 'coverImage', 'turfImages'].includes(file.fieldname)) {
      imageFilter(req, file, cb);
    } else if (['videos', 'turfVideos'].includes(file.fieldname)) {
      videoFilter(req, file, cb);
    } else {
      cb(new Error('Invalid field name'), false);
    }
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'turfImages', maxCount: 10 },
  { name: 'turfVideos', maxCount: 5 },
]);

export const processUpload = async (req, res, next) => {
  try {
    next();
  } catch (error) {
    const filesToDelete = [];

    if (req.file?.path) {
      filesToDelete.push(req.file.path);
    }

    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (file?.path) filesToDelete.push(file.path);
      });
    }

    await Promise.all(
      filesToDelete.map(filePath => fs.unlink(filePath).catch(() => {}))
    );

    if (error.message.includes('Only JPG') || error.message.includes('Only MP4')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Images/cover: max 5MB, Videos: max 100MB',
      });
    }

    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
};