import express from 'express';

import { JobRepository } from '../repositories/jobRepository';
import { Authenticate } from '../middleware/auth';
import { GetJobStatusUseCase } from '../usecases/getJobStatusUseCase';
import { GetJobStatusController } from '../controllers/GetJobStatusController';


const repository = new JobRepository();
const useCase = new GetJobStatusUseCase(repository);
const controller = new GetJobStatusController(useCase);

const getJobStatusRouter = express.Router();
//@ts-ignore
getJobStatusRouter.use(Authenticate)

getJobStatusRouter.get("/jobs/:id", async (req, res) => {
    await controller.onGetJobStatus(req, res);
});

export default getJobStatusRouter;
