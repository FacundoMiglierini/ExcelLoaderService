import { IFileRepository } from "../interfaces/IFileRepository";
import { IJobRepository } from "../interfaces/IJobRepository";
import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";
import { File } from "../interfaces/IFile";
import { FileModel } from "../entities/File";
import { JobModel } from "../entities/Job";
import DataTypes from "../enums/DataTypes";
import JobStatus from "../enums/Job";
import { publish } from "../services/Publisher";
import { isNumber, isNumberList } from "../utils/fileProcessingUtils";


export class UploadFileUseCase implements IUploadFileUseCase {

    private jobRepository: IJobRepository;
    private fileRepository: IFileRepository;

    constructor(jobRepository: IJobRepository, fileRepository: IFileRepository) {
        this.jobRepository = jobRepository
        this.fileRepository = fileRepository
    }

    async createJob(file_content: Object, file_content_length: Number, file_schema: Object) {

        const jobDoc = new JobModel({
            schema: file_schema,
            raw_data: file_content,
            raw_data_length: file_content_length
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

        const newFile: File = new FileModel({
            job_id: jobId,
        })
        await this.fileRepository.create(newFile)
        await this.jobRepository.updateFileRef(jobId, newFile.id);
        const ok = await this.processFile(jobId, newFile.id);
        if (ok) {
            await this.jobRepository.updateStatus(jobId, JobStatus.DONE);
            console.log(`File processed successfully.`);
        }
    }

    private validateSchema(format: { [key: string]: string }, processedSchema: { column: string, nullable: boolean, dataType: string}[]) {
        Object.entries(format).forEach(([key, value]) => {
            if (typeof key !== "string") 
                throw new Error("Incompatible file schema: column names must be strings.")

            const isNullable = key.toString().endsWith("?");
            const columnName = isNullable ? key.toString().slice(0, -1) : key.toString();
            const dataType = value.toLowerCase();

            processedSchema.push({
                column: columnName,
                nullable: isNullable,
                dataType: dataType,
            })
        });
    }


    private processRow(row: any, rowIndex: number, processedSchema: any[]) {
        const newRow: any = {}
        const rowErrors: { row: number; col: number}[] = []

        for (let i = 0; i < processedSchema.length; i++) {
            try {
                const cell = row[i]; 
                if (cell === null && !processedSchema[i]["nullable"]) {
                    throw new Error("Null cell within not nullable column.") 
                } else {
                    var formattedCell;
                    if (cell === null) {
                        continue;
                    } else {
                        switch (processedSchema[i]["dataType"]) {
                            case DataTypes.STRING:
                                if (isNumber(cell) || isNumberList(cell))
                                    throw new Error(`Cannot convert '${cell}' to a String: it is a Number or Array<Number>.`);
                                formattedCell = cell.toString();
                                break;
                            case DataTypes.NUMBER:
                                if (!isNumber(cell))
                                    throw new Error(`Cannot convert '${cell}' to a Number.`);
                                formattedCell = Number(cell);
                                break;
                            case DataTypes.ARRAY: 
                                if (!isNumberList(cell.toString()))
                                    throw new Error(`Cannot convert '${cell}' to an Array<Number>.`)
                                const numbers = cell.toString().split(',').map(Number); 
                                formattedCell = numbers.sort((a: number, b: number) => a - b);
                                break;
                        }
                    }
                    newRow[processedSchema[i]["column"]] = formattedCell
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

    private async processFile (jobId: string, fileId: string) {

        const format: any = await this.jobRepository.findSchema(jobId);
        const processedSchema: { column: string, nullable: boolean, dataType: string }[] = []
        this.validateSchema(format, processedSchema)

        const data_length = await this.jobRepository.findRawDataLength(jobId);

        const batchSize = 2048
        const batches = Math.ceil(data_length / batchSize);

        for (let batchIndex = 0; batchIndex < batches; batchIndex++) {

            const batchContent: typeof processedSchema[] = []
            const batchErrors: { row: number; col: number}[] = []
            const start = batchIndex * batchSize;
            const batch = await this.jobRepository.findRawData(jobId, batchIndex + 1, batchSize);

            batch.forEach((row: any, rowIndex: number) => {
                const { newRow, rowErrors } = this.processRow(row, rowIndex + start + 1, processedSchema);

                if (rowErrors.length === 0)
                    batchContent.push(newRow)

                batchErrors.push(...rowErrors);
            });

            const receivedData = await this.fileRepository.updateContent(fileId, batchContent)
            const receivedErrors = await this.jobRepository.updateErrors(jobId, batchErrors)

            if (!receivedData || !receivedErrors) {
                throw new Error("Interrupted data loading.")
            }
        }

        return true;
    }
}
