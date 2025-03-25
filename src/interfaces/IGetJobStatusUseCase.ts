export interface IGetJobStatusUseCase {
    getJobStatus(id: string, page: number, limit: number): any;
}
