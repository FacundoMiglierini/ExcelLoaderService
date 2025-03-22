import { JobModel } from "../entities/Job";
import { IJobInteractor } from "../interfaces/IJobInteractor";
import { IJobRepository } from "../interfaces/IJobRepository";
import { publish } from "../rabbitmqConnection";

export class JobInteractor implements IJobInteractor {

    private repository: IJobRepository;

    constructor(repository: IJobRepository) {
        this.repository = repository
    }

    async createJob(file_content: Object, file_schema: Object) {

        const jobDoc = new JobModel({
            schema: file_schema,
            raw_data: file_content
        });
        const job = await this.repository.create(jobDoc);
        console.log(`New job with id ${jobDoc.id} created.`)

        await publish(job.id);

        return job.id;
    }

    //TODO remove this function, unneeded
    async updateJobStatus(id: string, state: string) {

        this.repository.updateStatus(id, state);

    }

    //TODO rename as getJob
    async getJobStatus(id: string, pagination?: { offset?: number; limit?: number }) {

        return this.repository.find(id, pagination);
    }

}
