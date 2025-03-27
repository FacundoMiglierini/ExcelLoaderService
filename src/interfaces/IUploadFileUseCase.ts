export interface IUploadFileUseCase {
    createJob(filename: string, schema: string): any;
    createFile(data: { jobId: string, filename: string, schema: any }): any;
}
