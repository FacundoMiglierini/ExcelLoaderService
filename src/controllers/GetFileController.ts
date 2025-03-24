import { NextFunction, Request, Response } from "express";
import { IGetFileUseCase } from "../interfaces/IGetFileUseCase"; 

export class GetFileController {

    private useCase: IGetFileUseCase

    constructor(useCase: IGetFileUseCase) {
        this.useCase = useCase;
    }

    async onGetFile(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.useCase.getFile(req.params.id);

            return res.status(200).json(data);
        } catch(error) {
            next(error)
        }
    }
}
