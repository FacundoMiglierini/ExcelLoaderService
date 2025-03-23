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
            const { file_content, file_schema } = req.files as { [key: string]: Express.Multer.File[] };

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
            const jsonBuffer = file_schema[0]?.buffer;
            const schema = JSON.parse(jsonBuffer.toString());
            
            console.log("SCHEMA:")
            console.log(schema)

            if (!excelData || !schema) {
                throw new Error('Missing required fields: file_data and format');
            }

            const data = await this.interactor.createJob(excelData, schema);

            return res.status(200).json(data);

        } catch(error) {
            next(error)
        }
    }

    async onGetJobStatus(req: Request, res: Response, next: NextFunction) {
        try {

            const data = await this.interactor.getJobStatus(req.params.id);

            return res.status(200).json(data);

        } catch(error) {
            next(error)
        }
    }


    async onUpdateJobStatus(req: Request, res: Response, next: NextFunction) {
        try {

            const data = await this.interactor.updateJobStatus(req.params.id, req.params.status);

            return res.status(200).json(data);

        } catch(error) {
            next(error)
        }
    }
}
