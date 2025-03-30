import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";
import { INTERFACE_TYPE } from "../config/config";

@injectable()
export class UploadFileController {

    private useCase: IUploadFileUseCase

    constructor(
        @inject(INTERFACE_TYPE.UploadFileUseCase) useCase: IUploadFileUseCase
    ) {
        this.useCase = useCase;
    }

    async onCreateJob(req: Request, res: Response) {
        try {
            if (!req.file) {
                const error: any = new Error("Please upload an Excel file");
                error.name = "MissingFieldError";
                throw error;
            }
            if (!req.body.file_schema) {
                const error: any = new Error("Please upload a file schema");
                error.name = "MissingFieldError";
                throw error;
            }

            const filename = req.file.filename;
            const schema = req.body.file_schema;
            const jobId = await this.useCase.createJob(filename, schema);

            return res.status(202).json({
                message: 'File uploaded successfully',
                "job_id": jobId
            });

        } catch(error: any) {
            console.error(error)
            if (error.name === "MissingFieldError") {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

}
