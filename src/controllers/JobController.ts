import { NextFunction, Request, Response } from "express";
import { IJobInteractor } from "../interfaces/IJobInteractor";
import XLSX from 'xlsx';

export class JobController {

    private interactor: IJobInteractor

    constructor(interactor: IJobInteractor) {
        this.interactor = interactor;
    }

    async onCreateJob(req: Request, res: Response, next: NextFunction) {
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

            console.log("EXCEL DATA:")
            console.log(excelData)

            // Process JSON
            const schema = JSON.parse(req.body.file_schema.toString());
            
            console.log("SCHEMA:")
            console.log(schema)

            if (!excelData || !schema) {
                throw new Error('Missing required fields: file_data and format');
            }

            const jobId = await this.interactor.createJob(excelData, schema);

            return res.status(200).json({"job_id": jobId});

        } catch(error) {
            next(error)
        }
    }

    async onGetJobStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const jobId = req.params.id

            const { page = 1, limit = 10 } = req.query;

            // Ensure page and limit are integers
            const pageNumber = parseInt(page as string);
            const limitNumber = parseInt(limit as string);

            // Validate pagination parameters
            if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
                return res.status(400).send("Invalid pagination parameters");
            }

            const data = await this.interactor.getJobStatus(jobId, pageNumber, limitNumber);

            return res.status(200).json(data);
        } catch(error) {
            next(error)
        }
    }
}
