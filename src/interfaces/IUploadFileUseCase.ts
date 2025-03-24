export interface IUploadFileUseCase {
    createJob(file_content: Object, file_schema: Object): any;
    createFile(job_id: string): any;
}
