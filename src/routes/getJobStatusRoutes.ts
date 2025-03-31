import express, { Request, Response } from 'express';
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

// Create and configure the Inversify container to manage dependencies.
const container = new Container();

// Bind interfaces to their corresponding implementations
container.bind<IJobRepository>(INTERFACE_TYPE.JobRepository).to(JobRepository);
container.bind<IJobErrorRepository>(INTERFACE_TYPE.JobErrorRepository).to(JobErrorRepository);
container.bind<IGetJobStatusUseCase>(INTERFACE_TYPE.GetJobStatusUseCase).to(GetJobStatusUseCase);
container.bind(INTERFACE_TYPE.GetJobStatusController).to(GetJobStatusController);

// Create an Express router for handling the job status routes.
const getJobStatusRouter = express.Router();

// Apply authentication middleware to all routes in this router
//@ts-ignore
getJobStatusRouter.use(Authenticate)

// Get the controller from the container
const controller = container.get<GetJobStatusController>(INTERFACE_TYPE.GetJobStatusController)

// Define the route for fetching job status by job ID
getJobStatusRouter.get("/jobs/:id", async (req: Request, res: Response) => {
    await controller.onGetJobStatus(req, res);
});

export default getJobStatusRouter;
