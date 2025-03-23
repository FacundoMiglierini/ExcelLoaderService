export interface IJobInteractor {
    createJob(file_content: Object, file_schema: Object): any;
    getJobStatus(id: string, page: number, limit: number): any;
    updateJobStatus(id: string, status: string): any;
}
