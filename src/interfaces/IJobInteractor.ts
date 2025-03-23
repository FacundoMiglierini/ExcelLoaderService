export interface IJobInteractor {
    createJob(file_content: Object, file_schema: Object): any;
    getJobStatus(id: string, pagination?: { offset?: number; limit?: number }): any;
    updateJobStatus(id: string, status: string): any;
}
