export interface IUploadFileUseCase {
    createJob(filename: string, schema: string): any;
    saveFile(data: { jobId: string, filename: string, schema: any }): any;
}
