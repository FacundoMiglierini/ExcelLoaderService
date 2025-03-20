export interface IJobInteractor {
    createJob(input: any): any;
    getJobStatus(id: string): any;
    updateJobStatus(id: string, status: string): any;
}
