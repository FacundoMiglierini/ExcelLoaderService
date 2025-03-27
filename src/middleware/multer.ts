import multer from 'multer';
import path from 'path';

import { UPLOAD_DIR } from '../config/config';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '_' + file.originalname) // Use original filename as identifier
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  },
});
