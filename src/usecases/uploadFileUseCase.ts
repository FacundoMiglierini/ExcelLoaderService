import { IJobRepository } from "../interfaces/IJobRepository";
import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";
import { DataTypes, SchemaDataTypes } from "../enums/DataTypes";
import JobStatus from "../enums/Job";
import { publish } from "../services/Publisher";
import { isNumber, isNumberList } from "../utils/fileProcessingUtils";
import mongoose, { Schema, SchemaTypes } from "mongoose";
import { ICustomSchemaRepository } from "../interfaces/ICustomSchemaRepository";
import { readExcel } from "../utils/fileUploadingUtils";
import { UPLOAD_DIR } from "../config/config";


export class UploadFileUseCase implements IUploadFileUseCase {

    private jobRepository: IJobRepository;
    private customSchemaRepository: ICustomSchemaRepository;

    constructor(jobRepository: IJobRepository, customSchemaRepository: ICustomSchemaRepository) {
        this.jobRepository = jobRepository
        this.customSchemaRepository = customSchemaRepository
    }

    async createJob(filename: string, schema: string) {

        const job = await this.jobRepository.create(filename, schema);
        console.log(`New job with id ${job.id} created.`);
        await publish(job.id, filename, schema);

        return job.id;
    }

    async createFile(data: { jobId: string, filename: string, schema: string}) {

        const { jobId, filename, schema } = data;
        const res = await this.jobRepository.updateStatus(jobId, JobStatus.PROCESSING);

        if (!res)
            throw new Error("File Upload process not found.");

        const processedSchema = this.generateSchema(JSON.parse(schema));
        const parsedFileSchema = new Schema({ row: { type: SchemaTypes.Number, unique: true }, ...processedSchema});
        const parsedFileModel = mongoose.model(filename, parsedFileSchema);
        const ok = await this.processFile(jobId, filename, parsedFileModel, processedSchema);

        if (ok) {
            await this.jobRepository.updateStatus(jobId, JobStatus.DONE);
            console.log(`File processed successfully.`);
        }
    }

    private generateSchema(format: { [key: string]: string }) {
        const processedSchema: { [key: string]: { type: any, required: boolean } } = {};

        Object.entries(format).forEach(([key, value]) => {
            if (typeof key !== "string") 
                throw new Error("Incompatible file schema: column names must be strings.")

            const isRequired = !key.toString().endsWith("?");
            const columnName = isRequired ? key.toString() : key.toString().slice(0, -1);
            var dataType: any = '';            
            switch (value.toLowerCase()) {
                case DataTypes.STRING:
                    dataType = SchemaTypes.String;
                    break;
                case DataTypes.NUMBER:
                    dataType = SchemaTypes.Number;
                    break;
                case DataTypes.ARRAY:
                    dataType = SchemaTypes.Array; 
                    break;
                default:
                    const error: Error = new Error("Incompatible file schema: incorrect data type.");
                    error.name = "BadRequestError";
                    throw error;
            }

            processedSchema[columnName] = {
                type: dataType,
                required: isRequired
            }
        });

        return processedSchema;
    }

    private processRow(row: any, rowIndex: number, schema: any[]) {
        const newRow: any = {}
        const rowErrors: { row: number; col: number}[] = []
        newRow["row"] = rowIndex

        for (let i = 0; i < schema.length; i++) {
            try {
                const cell = row[i]; 
                if ((cell === null || cell === '' || cell === 'undefined') && schema[i]["required"]) {
                    throw new Error("Null cell within not nullable column.") 
                } else {
                    var formattedCell;
                    if (cell === null) {
                        continue;
                    } else {
                        switch (schema[i]["type"] as string) {
                            case SchemaDataTypes.STRING:
                                if (isNumber(cell) || isNumberList(cell))
                                    throw new Error(`Cannot convert '${cell}' to a String: it is a Number or Array<Number>.`);
                                formattedCell = cell.toString();
                                break;
                            case SchemaDataTypes.NUMBER:
                                if (!isNumber(cell))
                                    throw new Error(`Cannot convert '${cell}' to a Number.`);
                                formattedCell = Number(cell);
                                break;
                            case SchemaDataTypes.ARRAY: 
                                if (!isNumberList(cell.toString()))
                                    throw new Error(`Cannot convert '${cell}' to an Array<Number>.`)
                                const numbers = cell.toString().split(',').filter((val: string) => val.trim() !== '').map(Number);
                                formattedCell = numbers.sort((a: number, b: number) => a - b);
                                break;
                        }
                    }
                    newRow[schema[i]["column"]] = formattedCell
                }
            } catch (error) {
                rowErrors.push({
                    row: rowIndex,
                    col: i + 1
                })
            }
        }

        return { newRow, rowErrors };
    }

    private async processFile (jobId: string, filename: string, model: any, schema: { [key: string] : { type: string, required: boolean } }) {

        const schemaAsList = Object.keys(schema).map(key => {
            //@ts-ignore
            const type = schema[key].type.name; 
            const required = schema[key].required;

            return {
              column: key,
              required,
              type
            };
        });

        const data = readExcel(`${UPLOAD_DIR}/${filename}`);
        let rowIndex = 0;

        const batchContent: any[] = []
        const batchErrors: { row: number, col: number }[] = []

        for (const row of data) {

            rowIndex++;

            const { newRow, rowErrors } = this.processRow(row, rowIndex, schemaAsList);

            if (rowErrors.length > 0) {
                batchErrors.push(...rowErrors);
                await this.jobRepository.saveBatchErrors(jobId, batchErrors);
                continue
            }

            batchContent.push(newRow);
            await this.customSchemaRepository.saveBatchContent(batchContent, model);
        }

        await this.customSchemaRepository.saveBatchContent(batchContent, model, true)
        await this.jobRepository.saveBatchErrors(jobId, batchErrors, true)

        return true;
    }
}
