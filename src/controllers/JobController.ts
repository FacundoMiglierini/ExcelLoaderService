import { NextFunction, Request, Response } from "express";
import { IJobInteractor } from "../interfaces/IJobInteractor";

export class JobController {

    private interactor: IJobInteractor

    constructor(interactor: IJobInteractor) {
        this.interactor = interactor;
    }

    async onCreateJob(req: Request, res: Response, next: NextFunction) {
        try {

            const body = req.body;

            const data = await this.interactor.createJob(body);

            return res.status(200).json(data);

        } catch(error) {
            next(error)
        }
    }

    async onGetJobStatus(req: Request, res: Response, next: NextFunction) {
        try {

            const id = parseInt(req.params.id);

            const data = await this.interactor.getJobStatus(id);

            return res.status(200).json(data);

        } catch(error) {
            next(error)
        }
    }
}
