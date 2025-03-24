import { IFileRepository } from "../interfaces/IFileRepository";
import { IJobRepository } from "../interfaces/IJobRepository";
import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";
import { Job } from "../interfaces/IJob";
import { File } from "../interfaces/IFile";
import { FileModel } from "../entities/File";
import { JobModel } from "../entities/Job";
import DataTypes from "../enums/DataTypes";
import JobStatus from "../enums/Job";
import { publish } from "../services/rabbitPublisher";
import { isNumber, isNumberList } from "../utils/fileProcessingUtils";


export class UploadFileUseCase implements IUploadFileUseCase {

    private jobRepository: IJobRepository;
    private fileRepository: IFileRepository;

    constructor(jobRepository: IJobRepository, fileRepository: IFileRepository) {
        this.jobRepository = jobRepository
        this.fileRepository = fileRepository
    }

    async createJob(file_content: Object, file_schema: Object) {

        const jobDoc = new JobModel({
            schema: file_schema,
            raw_data: file_content
        });
        const job = await this.jobRepository.create(jobDoc);
        console.log(`New job with id ${jobDoc.id} created.`)

        await publish(job.id);

        return job.id;
    }

    async createFile(jobId: string) {

        const job = await this.jobRepository.find(jobId)

        if (!job)
            throw new Error("File Upload process not found.");

        await this.jobRepository.updateStatus(job.id, JobStatus.PROCESSING);
        const file = this.processFile(job);

        if (job.job_errors.length > 0) 
            await this.jobRepository.updateErrors(job.id, job.job_errors);

        await this.fileRepository.create(file);
        await this.jobRepository.updateStatus(job.id, JobStatus.DONE);
        await this.jobRepository.updateFileRef(job.id, job.file_id);

        console.log(`File processed successfully.`);
    }

    private validateSchema(format: { [key: string]: string }, processedSchema: { column: string, nullable: boolean, dataType: string}[]) {
        Object.entries(format).forEach(([key, value]) => {
            if (typeof key !== "string") 
                throw new Error("Incompatible file schema: column names must be strings.")

            // Normalización del nombre de columna
            const isNullable = key.toString().endsWith("?");
            const columnName = isNullable ? key.toString().slice(0, -1) : key.toString();
            // Extracción del tipo de dato
            const dataType = value.toLowerCase();

            processedSchema.push({
                column: columnName,
                nullable: isNullable,
                dataType: dataType,
            })
        });
    }

    private processFile (job: Job) {

        const format: any = job.schema 
        const raw_data: any = job.raw_data

        const processedSchema: { column: string, nullable: boolean, dataType: string }[] = []

        this.validateSchema(format, processedSchema)

        const processedFile: typeof processedSchema[] = []
        const totalErrors: { row: number; col: number}[] = []

        raw_data.slice(1).forEach((row: any, rowIndex: number) => {

            const newRow: any = {}
            const rowErrors: { row: number; col: number}[] = []

            for (let i = 0; i < processedSchema.length; i++) {
                try {
                    const cell = row[i]
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
                                    if (!isNumberList(cell))
                                        throw new Error(`Cannot convert '${cell}' to an Array<Number>.`)
                                    const numbers = cell.split(',').map(Number); 
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

            if (rowErrors.length === 0)
                processedFile.push(newRow)

            totalErrors.push(...rowErrors);
        });

        //console.log("PROCESSED FILE:")
        //console.log(processedFile)

        //console.log("ERRORS:")
        //console.log(totalErrors)

        const newFile: File = new FileModel({
            data: processedFile, 
            job_id: job.id,
        })

        job.job_errors = totalErrors
        job.file_id = newFile.id

        return newFile;
    }
}
