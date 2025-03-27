export interface IUploadFileUseCase {
    createJob(file_name: string, file_content: Object, file_content_length: number, file_schema: Object): any;
    createFile(job_id: string): any;
}
