import express from 'express';
import multer from 'multer';

import { JobController } from '../controllers/JobController';
import { JobRepository } from '../repositories/jobRepository';
import { JobInteractor} from '../interactors/jobInteractor';
import { Authenticate } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const repository = new JobRepository();
const interactor = new JobInteractor(repository);
const controller = new JobController(interactor);

const jobRouter = express.Router();
//@ts-ignore
jobRouter.use(Authenticate)

jobRouter.post("/jobs", upload.fields([
  { name: 'file_content', maxCount: 1 },
  { name: 'file_schema', maxCount: 1 }
]), async (req, res, next) => {
    await controller.onCreateJob(req, res, next);
});
jobRouter.get("/jobs/:id", async (req, res, next) => {
    await controller.onGetJobStatus(req, res, next);
});
jobRouter.patch("/jobs/:id", async (req, res, next) => {
    await controller.onUpdateJobStatus(req, res, next);
});

export default jobRouter;
