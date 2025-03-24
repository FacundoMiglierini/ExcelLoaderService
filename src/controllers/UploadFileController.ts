import { Request, Response } from "express";
import XLSX from 'xlsx';

import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";


export class UploadFileController {

    private useCase: IUploadFileUseCase

    constructor(useCase: IUploadFileUseCase) {
        this.useCase = useCase;
    }

    async onCreateJob(req: Request, res: Response) {
        try {
            const { file_content } = req.files as { [key: string]: Express.Multer.File[] };

            // Process Excel
            const excelBuffer = file_content[0]?.buffer;
            const workbook = XLSX.read(excelBuffer);
            const sheetName = workbook.SheetNames[0];
            const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
              header: 1,
              raw: true,
              blankrows: true,
              defval: null,
              rawNumbers: true
            });

            // Process schema
            const schema = JSON.parse(req.body.file_schema.toString());
            
            if (!excelData || !schema) {
                const error: any = new Error("Missing required fields: file_data and/or file_schema");
                error.name = "MissingFieldError"; 
                throw error;
            }

            const jobId = await this.useCase.createJob(excelData, schema);

            return res.status(202).json({"job_id": jobId});

        } catch(error: any) {
            if (error.name === "MissingFieldError") {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

}
