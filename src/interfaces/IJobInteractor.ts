export interface IJobInteractor {
    createJob(input: any): any;
    getJobStatus(id: Number): any;
    updateJobStatus(id: Number, status: String): any;
}
