import express, { Request, Response } from 'express';
import { Container } from 'inversify';

import { Authenticate } from '../middleware/auth';
import { multerErrorHandler , upload } from '../middleware/multer';
import { IJobRepository } from '../interfaces/IJobRepository';
import { INTERFACE_TYPE } from '../config/config';
import { JobRepository } from '../repositories/jobRepository';
import { IJobErrorRepository } from '../interfaces/IJobErrorRepository';
import { JobErrorRepository } from '../repositories/jobErrorRepository';
import { ICustomModelRepository } from '../interfaces/ICustomModelRepository';
import { CustomModelRepository } from '../repositories/customModelRepository';
import { IUploadFileUseCase } from '../interfaces/IUploadFileUseCase';
import { UploadFileUseCase } from '../usecases/uploadFileUseCase';
import { UploadFileController } from '../controllers/UploadFileController';

// Create and configure the Inversify container to manage dependencies.
const container = new Container();

// Bind interfaces to their corresponding implementations
container.bind<IJobRepository>(INTERFACE_TYPE.JobRepository).to(JobRepository);
container.bind<IJobErrorRepository>(INTERFACE_TYPE.JobErrorRepository).to(JobErrorRepository);
container.bind<ICustomModelRepository>(INTERFACE_TYPE.CustomModelRepository).to(CustomModelRepository);
container.bind<IUploadFileUseCase>(INTERFACE_TYPE.UploadFileUseCase).to(UploadFileUseCase);
container.bind(INTERFACE_TYPE.UploadFileController).to(UploadFileController);

// Create an Express router for handling the file upload route.
const uploadFileRouter = express.Router();

// Apply authentication middleware to all routes in this router
//@ts-ignore
uploadFileRouter.use(Authenticate);

// Get the UploadFileController from the container
const controller = container.get<UploadFileController>(INTERFACE_TYPE.UploadFileController);

// Define the route for uploading files
uploadFileRouter.post("/files", upload.single('file_content'), multerErrorHandler, async (req: Request, res: Response) => {
    await controller.onUploadFile(req, res);
});

export default uploadFileRouter;
