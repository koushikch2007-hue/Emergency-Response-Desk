import multer from 'multer';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../services/storageService.js';

const storage = multer.memoryStorage();

export const uploadPhotos = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${file.mimetype}). Only JPEG, PNG, and WebP images are allowed.`));
    }
  },
}).array('photos', 5);
