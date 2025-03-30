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

const container = new Container();

container.bind<IJobRepository>(INTERFACE_TYPE.JobRepository).to(JobRepository);
container.bind<IJobErrorRepository>(INTERFACE_TYPE.JobErrorRepository).to(JobErrorRepository);
container.bind<ICustomModelRepository>(INTERFACE_TYPE.CustomModelRepository).to(CustomModelRepository);
container.bind<IUploadFileUseCase>(INTERFACE_TYPE.UploadFileUseCase).to(UploadFileUseCase);
container.bind(INTERFACE_TYPE.UploadFileController).to(UploadFileController);

const uploadFileRouter = express.Router();
//@ts-ignore
uploadFileRouter.use(Authenticate);

const controller = container.get<UploadFileController>(INTERFACE_TYPE.UploadFileController);

uploadFileRouter.post("/files", upload.single('file_content'), multerErrorHandler, async (req: Request, res: Response) => {
    await controller.onCreateJob(req, res);
});

export default uploadFileRouter;
