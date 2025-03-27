import express from 'express';
import multer from 'multer';

import { JobRepository } from '../repositories/jobRepository';
import { Authenticate } from '../middleware/auth';
import { FileRepository } from '../repositories/fileRepository';
import { UploadFileController } from '../controllers/UploadFileController';
import { UploadFileUseCase } from '../usecases/uploadFileUseCase';
import { CustomSchemaRepository } from '../repositories/customSchemaRepository';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const jobRepository = new JobRepository();
const fileRepository = new FileRepository();
const customSchemaRepository = new CustomSchemaRepository();
const useCase = new UploadFileUseCase(jobRepository, fileRepository, customSchemaRepository);
const controller = new UploadFileController(useCase);

const uploadFileRouter = express.Router();
//@ts-ignore
uploadFileRouter.use(Authenticate)

uploadFileRouter.post("/files", upload.fields([
  { name: 'file_content', maxCount: 1 },
]), async (req, res) => {
    await controller.onCreateJob(req, res);
});

export default uploadFileRouter;
