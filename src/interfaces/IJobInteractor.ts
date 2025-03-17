export interface IJobInteractor {
    createJob(input: any): any;
    getJobStatus(id: Number): any;
}
