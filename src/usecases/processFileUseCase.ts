import { inject, injectable } from "inversify";

import { IJobRepository } from "../interfaces/IJobRepository";
import JobStatus from "../enums/Job";
import { schemaAsList, isCellInvalid, formatCell } from "../utils/fileProcessingUtils";
import { ICustomModelRepository } from "../interfaces/ICustomModelRepository";
import { readExcel } from "../utils/fileUploadingUtils";
import { INTERFACE_TYPE, UPLOAD_DIR } from "../config/config";
import { JobError } from "../interfaces/IJobError";
import { IJobErrorRepository } from "../interfaces/IJobErrorRepository";
import { Model } from "mongoose";
import { IProcessFileUseCase } from "../interfaces/IProcessFileUseCase";


// Use Case responsible for handling the logic to process a file.
@injectable()
export class ProcessFileUseCase implements IProcessFileUseCase {

    private jobRepository: IJobRepository;
    private jobErrorRepository: IJobErrorRepository;
    private customModelRepository: ICustomModelRepository;

    constructor(
        @inject(INTERFACE_TYPE.JobRepository) jobRepository: IJobRepository, 
        @inject(INTERFACE_TYPE.JobErrorRepository) jobErrorRepository: IJobErrorRepository, 
        @inject(INTERFACE_TYPE.CustomModelRepository) customModelRepository: ICustomModelRepository
    ) {
        this.jobRepository = jobRepository
        this.jobErrorRepository = jobErrorRepository
        this.customModelRepository = customModelRepository
    }

    // Entry point for broker Consumer
    async processFile(data: { jobId: string, filename: string, schema: any}) {

        const { jobId, filename, schema } = data;
        const res = await this.jobRepository.updateStatus(jobId, JobStatus.PROCESSING);

        if (!res)
            throw new Error("File Upload process not found.");

        const model = await this.customModelRepository.create(filename, schema);
        const ok = await this.processFileBatches(jobId, filename, model, schema);

        if (ok) {
            await this.jobRepository.updateStatus(jobId, JobStatus.DONE);
            console.log(`File processed successfully.`);
        }
    }

    // Processes a single row of data and validates each cell based on the schema
    private processRow(jobId: string, row: any, rowIndex: number, schema: any[]) {

        const newRow: any = { row: rowIndex };
        const rowErrors: JobError[] = [];

        schema.forEach((columnSchema, index) => {
            try {
                const cell = row[index];
                const columnName = columnSchema["column"];
                const required = columnSchema["required"];
                const type = columnSchema["type"];

                if (isCellInvalid(cell, required)) {
                    throw new Error("Null cell within not nullable column.");
                } 

                let formattedCell = formatCell(cell, type);

                if (formattedCell !== undefined) {
                    newRow[columnName] = formattedCell;
                }

            } catch (error) {
                console.error(error);
                rowErrors.push({
                    job_id: jobId,
                    row: rowIndex,
                    col: index + 1
                });
            }
        });

        return { newRow, rowErrors };
    }

    // Processes the file in batches of rows
    private async processFileBatches(jobId: string, filename: string, model: Model<any>, schema: { [key: string] : { type: string, required: boolean } }) {

        const parsedSchema = schemaAsList(schema);
        const data = readExcel(`${UPLOAD_DIR}/${filename}`);
        let rowIndex = 0;
        const batchContent: any[] = []
        const batchErrors: JobError[] = []

        for (const row of data) {

            rowIndex++;
            const { newRow, rowErrors } = this.processRow(jobId, row, rowIndex, parsedSchema);

            if (rowErrors.length > 0) {
                batchErrors.push(...rowErrors);
                await this.jobErrorRepository.saveMany(batchErrors);
                continue
            }

            batchContent.push(newRow);
            await this.customModelRepository.saveMany(batchContent, model);
        }

        await this.jobErrorRepository.saveMany(batchErrors, true)
        await this.customModelRepository.saveMany(batchContent, model, true)

        return true;
    }
}
