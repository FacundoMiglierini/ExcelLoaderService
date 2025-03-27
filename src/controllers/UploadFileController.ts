import { Request, Response } from "express";

import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";


export class UploadFileController {

    private useCase: IUploadFileUseCase

    constructor(useCase: IUploadFileUseCase) {
        this.useCase = useCase;
    }

    async onCreateJob(req: Request, res: Response) {
        try {
            if (!req.file) {
                const error: any = new Error("Please upload an Excel file");
                error.name = "MissingFieldError";
                throw error;
            }

            const filePath = req.file.path;
            const schema = req.body.file_schema;
            const jobId = await this.useCase.createJob(filePath, schema);

            return res.status(202).json({
                message: 'File uploaded successfully',
                "job_id": jobId
            });

        } catch(error: any) {
            if (error.name === "MissingFieldError") {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

}
