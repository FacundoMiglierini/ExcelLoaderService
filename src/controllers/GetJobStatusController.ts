import { Request, Response } from "express";
import { IGetJobStatusUseCase } from "../interfaces/IGetJobStatusUseCase";


export class GetJobStatusController {

    private useCase: IGetJobStatusUseCase

    constructor(useCase: IGetJobStatusUseCase) {
        this.useCase = useCase;
    }

    async onGetJobStatus(req: Request, res: Response) {
        try {
            const jobId = req.params.id
            const { page = 1, limit = 10 } = req.query;
            const pageNumber = parseInt(page as string);
            const limitNumber = parseInt(limit as string);

            if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
                return res.status(400).send({ message: "Invalid pagination parameters" });
            }

            const data = await this.useCase.getJobStatus(jobId, pageNumber, limitNumber);

            return res.status(200).json(data);
        } catch(error: any) {
            if (error.name === "NotFoundError") {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}
