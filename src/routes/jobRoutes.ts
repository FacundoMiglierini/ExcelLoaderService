import express from 'express';
import { JobController } from '../controllers/JobController';
import { JobRepository } from '../repositories/jobRepository';
import { JobInteractor} from '../interactors/jobInteractor';

const repository = new JobRepository();
const interactor = new JobInteractor(repository);
const controller = new JobController(interactor);


const jobRouter = express.Router();

//jobRouter.post("/jobs", controller.onCreateJob.bind(controller));
//jobRouter.get("/jobs/:id", controller.onGetJobStatus.bind(controller));

jobRouter.post("/jobs", async (req, res, next) => {
    await controller.onCreateJob(req, res, next);
});
jobRouter.get("/jobs/:id", async (req, res, next) => {
    await controller.onGetJobStatus(req, res, next);
});
jobRouter.patch("/jobs/:id", async (req, res, next) => {
    await controller.onUpdateJobStatus(req, res, next);
});

export default jobRouter;
