import express from 'express';

import { JobRepository } from '../repositories/jobRepository';
import { Authenticate } from '../middleware/auth';
import { FileRepository } from '../repositories/fileRepository';
import { UploadFileController } from '../controllers/UploadFileController';
import { UploadFileUseCase } from '../usecases/uploadFileUseCase';
import { CustomSchemaRepository } from '../repositories/customSchemaRepository';
import { upload } from '../middleware/multer';


const jobRepository = new JobRepository();
const fileRepository = new FileRepository();
const customSchemaRepository = new CustomSchemaRepository();
const useCase = new UploadFileUseCase(jobRepository, fileRepository, customSchemaRepository);
const controller = new UploadFileController(useCase);

const uploadFileRouter = express.Router();
//@ts-ignore
uploadFileRouter.use(Authenticate)

uploadFileRouter.post("/files", upload.single('file_content'), async (req, res) => {
    await controller.onCreateJob(req, res);
});

export default uploadFileRouter;
