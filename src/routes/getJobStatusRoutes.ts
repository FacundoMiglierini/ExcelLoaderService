import express from 'express';

import { JobRepository } from '../repositories/jobRepository';
import { Authenticate } from '../middleware/auth';
import { GetJobStatusUseCase } from '../usecases/getJobStatusUseCase';
import { GetJobStatusController } from '../controllers/GetJobStatusController';
import { JobErrorRepository } from '../repositories/jobErrorRepository';


const jobRepository = new JobRepository();
const jobErrorRepository = new JobErrorRepository();
const useCase = new GetJobStatusUseCase(jobRepository, jobErrorRepository);
const controller = new GetJobStatusController(useCase);

const getJobStatusRouter = express.Router();
//@ts-ignore
getJobStatusRouter.use(Authenticate)

getJobStatusRouter.get("/jobs/:id", async (req, res) => {
    await controller.onGetJobStatus(req, res);
});

export default getJobStatusRouter;
