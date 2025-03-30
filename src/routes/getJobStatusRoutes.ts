import express from 'express';
import { Container } from 'inversify';

import { JobRepository } from '../repositories/jobRepository';
import { Authenticate } from '../middleware/auth';
import { GetJobStatusUseCase } from '../usecases/getJobStatusUseCase';
import { GetJobStatusController } from '../controllers/GetJobStatusController';
import { JobErrorRepository } from '../repositories/jobErrorRepository';
import { IJobRepository } from '../interfaces/IJobRepository';
import { INTERFACE_TYPE } from '../config/config';
import { IJobErrorRepository } from '../interfaces/IJobErrorRepository';
import { IGetJobStatusUseCase } from '../interfaces/IGetJobStatusUseCase';

const container = new Container();

container.bind<IJobRepository>(INTERFACE_TYPE.JobRepository).to(JobRepository);
container.bind<IJobErrorRepository>(INTERFACE_TYPE.JobErrorRepository).to(JobErrorRepository);
container.bind<IGetJobStatusUseCase>(INTERFACE_TYPE.GetJobStatusUseCase).to(GetJobStatusUseCase);
container.bind(INTERFACE_TYPE.GetJobStatusController).to(GetJobStatusController);

const getJobStatusRouter = express.Router();
//@ts-ignore
getJobStatusRouter.use(Authenticate)

const controller = container.get<GetJobStatusController>(INTERFACE_TYPE.GetJobStatusController)

getJobStatusRouter.get("/jobs/:id", async (req, res) => {
    await controller.onGetJobStatus(req, res);
});

export default getJobStatusRouter;
