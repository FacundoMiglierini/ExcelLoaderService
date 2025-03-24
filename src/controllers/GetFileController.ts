import { Request, Response } from "express";
import { IGetFileUseCase } from "../interfaces/IGetFileUseCase"; 

export class GetFileController {

    private useCase: IGetFileUseCase

    constructor(useCase: IGetFileUseCase) {
        this.useCase = useCase;
    }

    async onGetFile(req: Request, res: Response) {
        try {
            const data = await this.useCase.getFile(req.params.id);

            return res.status(200).json(data);
        } catch(error: any) {
            if (error.name === "NotFoundError") {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}
