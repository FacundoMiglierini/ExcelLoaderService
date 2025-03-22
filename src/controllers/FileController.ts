import { NextFunction, Request, Response } from "express";
import { IFileInteractor } from "../interfaces/IFileInteractor";

export class FileController {

    private interactor: IFileInteractor

    constructor(interactor: IFileInteractor) {
        this.interactor = interactor;
    }

    async onGetFile(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.interactor.getFile(req.params.id);

            return res.status(200).json(data);
        } catch(error) {
            next(error)
        }
    }
}
