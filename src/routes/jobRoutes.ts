import express from 'express';
import { JobController } from '../controllers/JobController';

const controller = new JobController();

const jobRouter = express.Router();

jobRouter.post("/jobs", controller.onCreateJob);

jobRouter.get("/jobs/:id", controller.onGetJobStatus);

export default jobRouter;
