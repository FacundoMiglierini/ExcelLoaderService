import multer from 'multer';
import path from 'path';

import { UPLOAD_DIR } from '../config/config';
import { Request, Response, NextFunction } from 'express';

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
            const error = new Error('Only Excel files are allowed');
            error.name = 'InvalidFileType';
            return cb(error);
        }
        cb(null, true);
    },
});

export const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ message: 'File size limit exceeded.' });
        } else {
            res.status(400).json({ message: 'Error occurred during file upload.' });
        }
    } else if (err.name === 'InvalidFileType') {
        res.status(400).json({ message: err.message });
    } else {
        next(err); // Pass other errors to the next error handler
    }
};
