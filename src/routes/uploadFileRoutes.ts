import express from 'express';
import { Container } from 'inversify';

import { Authenticate } from '../middleware/auth';
import { upload } from '../middleware/multer';
import { IJobRepository } from '../interfaces/IJobRepository';
import { INTERFACE_TYPE } from '../config/config';
import { JobRepository } from '../repositories/jobRepository';
import { IJobErrorRepository } from '../interfaces/IJobErrorRepository';
import { JobErrorRepository } from '../repositories/jobErrorRepository';
import { ICustomSchemaRepository } from '../interfaces/ICustomSchemaRepository';
import { CustomSchemaRepository } from '../repositories/customSchemaRepository';
import { IUploadFileUseCase } from '../interfaces/IUploadFileUseCase';
import { UploadFileUseCase } from '../usecases/uploadFileUseCase';
import { UploadFileController } from '../controllers/UploadFileController';

const container = new Container();

container.bind<IJobRepository>(INTERFACE_TYPE.JobRepository).to(JobRepository);
container.bind<IJobErrorRepository>(INTERFACE_TYPE.JobErrorRepository).to(JobErrorRepository);
container.bind<ICustomSchemaRepository>(INTERFACE_TYPE.CustomSchemaRepository).to(CustomSchemaRepository);
container.bind<IUploadFileUseCase>(INTERFACE_TYPE.UploadFileUseCase).to(UploadFileUseCase);
container.bind(INTERFACE_TYPE.UploadFileController).to(UploadFileController);

const uploadFileRouter = express.Router();
//@ts-ignore
uploadFileRouter.use(Authenticate);

const controller = container.get<UploadFileController>(INTERFACE_TYPE.UploadFileController);

uploadFileRouter.post("/files", upload.single('file_content'), async (req, res) => {
    await controller.onCreateJob(req, res);
});

export default uploadFileRouter;
