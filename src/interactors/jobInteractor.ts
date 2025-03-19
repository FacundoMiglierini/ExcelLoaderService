import { JobModel } from "../entities/Job";
import { Job } from "../interfaces/IJob";
import { IJobInteractor } from "../interfaces/IJobInteractor";
import { IJobRepository } from "../interfaces/IJobRepository";
import { publish } from "../rabbitmqConnection";

export class JobInteractor implements IJobInteractor {

    private repository: IJobRepository;

    constructor(repository: IJobRepository) {
        this.repository = repository
    }

    async createJob(input: any) {
        const jobDoc = new JobModel({
            id: 16,
            state: 'pending',
            job_errors: [],
            file_id: ''
        });

        const job = await this.repository.create(jobDoc);
        const jobId = job!.id 

        publish({input: input, jobId: jobId});

        return jobId;
    }

    async updateJobStatus(id: Number, state: String) {

        this.repository.updateStatus(id, state);

    }

    async getJobStatus(id: Number) {

        return this.repository.find(id);
    }

}
