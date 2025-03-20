import { JobModel } from "../entities/Job";
import { IJobInteractor } from "../interfaces/IJobInteractor";
import { IJobRepository } from "../interfaces/IJobRepository";
import { publish } from "../rabbitmqConnection";

export class JobInteractor implements IJobInteractor {

    private repository: IJobRepository;

    constructor(repository: IJobRepository) {
        this.repository = repository
    }

    async createJob(input: any) {

        const jobDoc = new JobModel();
        const job = await this.repository.create(jobDoc);

        await publish({input: input, jobId: job.id});

        return job.id;
    }

    async updateJobStatus(id: string, state: string) {

        this.repository.updateStatus(id, state);

    }

    async getJobStatus(id: string, pagination?: { offset?: number; limit?: number }) {

        return this.repository.find(id, pagination);
    }

}
