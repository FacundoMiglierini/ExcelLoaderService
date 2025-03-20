import express from 'express';
import { FileRepository } from '../repositories/fileRepository';
import { FileInteractor } from '../interactors/fileInteractor';
import { FileController } from '../controllers/FileController';

const repository = new FileRepository();
const interactor = new FileInteractor(repository);
const controller = new FileController(interactor);

const fileRouter = express.Router();

fileRouter.get("/files/:id", async (req, res, next) => {
    await controller.onGetFile(req, res, next);
});

export default fileRouter;
