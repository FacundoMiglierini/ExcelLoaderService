import { IFileRepository } from "../interfaces/IFileRepository";
import { IJobRepository } from "../interfaces/IJobRepository";
import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";
import { FileModel } from "../entities/File";
import { JobModel } from "../entities/Job";
import { DataTypes, SchemaDataTypes } from "../enums/DataTypes";
import JobStatus from "../enums/Job";
import { publish } from "../services/Publisher";
import { isNumber, isNumberList } from "../utils/fileProcessingUtils";
import mongoose, { Schema, SchemaTypes } from "mongoose";


export class UploadFileUseCase implements IUploadFileUseCase {

    private jobRepository: IJobRepository;
    private fileRepository: IFileRepository;

    constructor(jobRepository: IJobRepository, fileRepository: IFileRepository) {
        this.jobRepository = jobRepository
        this.fileRepository = fileRepository
    }

    async createJob(file_name: String, file_content: Object, file_content_length: Number, file_schema: Object) {

        const fileDoc = new FileModel({
            name: file_name, 
            content: file_content,
            length: file_content_length,
            schema: file_schema
        });
        await this.fileRepository.create(fileDoc);
        console.log(`File "${fileDoc.name}" created.`)
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const parsedFileCollectionName = `${fileDoc.name}_${timestamp}`;
        const jobDoc = new JobModel({
            excel_file_id: fileDoc.id,
            parsed_file_collection: parsedFileCollectionName
        });
        const job = await this.jobRepository.create(jobDoc);
        console.log(`New job with id ${jobDoc.id} created.`)
        await publish(job.id);

        return job.id;
    }

    async createFile(jobId: string) {

        const res = await this.jobRepository.updateStatus(jobId, JobStatus.PROCESSING);
        if (!res)
            throw new Error("File Upload process not found.");

        const fileId = await this.jobRepository.findExcelFileRef(jobId);
        const schema: any = await this.fileRepository.findSchema(fileId);
        const processedSchema = this.generateSchema(schema); //TODO move function to utils?
        const parsedFileSchema = new Schema({ row: { type: SchemaTypes.Number, unique: true }, ...processedSchema });
        const collectionName = await this.jobRepository.findParsedFileCollection(jobId);
        const parsedFileModel = mongoose.model(collectionName, parsedFileSchema);
        const ok = await this.processFile(jobId, fileId, parsedFileModel, processedSchema);

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
                if ((cell === null) && schema[i]["required"]) {
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
                    row: rowIndex + 1,
                    col: i + 1
                })
            }
        }

        return { newRow, rowErrors };
    }

    private async processFile (jobId: string, fileId: string, model: any, schema: { [key: string] : { type: string, required: boolean } }) {

        const data_length = await this.fileRepository.findContentLength(fileId);
        const batchSize = 1024
        const batches = Math.ceil(data_length / batchSize);
        const schemaAsList = Object.keys(schema).map(key => {
            const type = schema[key].type.name; 
            const required = schema[key].required;

            return {
              column: key,
              required,
              type
            };
          });

        for (let batchIndex = 0; batchIndex < batches; batchIndex++) {

            const batchContent: any[] = []
            const batchErrors: { row: number, col: number }[] = []
            const start = batchIndex * batchSize;
            const batch = await this.fileRepository.findContent(fileId, batchIndex + 1, batchSize);

            batch.forEach((row: any, rowIndex: number) => {
                const { newRow, rowErrors } = this.processRow(row, rowIndex + start + 1, schemaAsList);

                if (rowErrors.length === 0)
                    batchContent.push(newRow)

                batchErrors.push(...rowErrors);
            });

            //TODO remove logs
            model.insertMany(batchContent).then(() => {
                console.log(`New ${batchSize} documents inserted.`); 
            })
            .catch((error: any) => {
                console.error('Error instering new documents:', error);
            });
            this.jobRepository.updateErrors(jobId, batchErrors).then(() => {
                console.log(`New ${batchErrors.length} errors inserted.`);
            })
            .catch((error: any) => {
                console.error('Error inserting new errors:', error);
            });

        }

        return true;
    }
}
