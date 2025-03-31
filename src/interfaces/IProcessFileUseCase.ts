export interface IProcessFileUseCase {
    processFile(data: { jobId: string, filename: string, schema: any }): any;
}
