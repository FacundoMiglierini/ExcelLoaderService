import express from 'express';

import { FileRepository } from '../repositories/fileRepository';
import { GetFileUseCase } from '../usecases/getFileUseCase';
import { Authenticate } from '../middleware/auth';
import { GetFileController } from '../controllers/GetFileController';

const repository = new FileRepository();
const useCase = new GetFileUseCase(repository);
const controller = new GetFileController(useCase);

const getFileRouter = express.Router();
//@ts-ignore
getFileRouter.use(Authenticate)

getFileRouter.get("/files/:id", async (req, res) => {
    await controller.onGetFile(req, res);
});

export default getFileRouter;
