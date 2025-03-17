import { IJobRepository } from "../interfaces/IJobRepository";
import { Job } from "../interfaces/IJob";
import { JobModel } from "../entities/Job";

export class JobRepository implements IJobRepository {

    async create(data: Job): Promise<Job> {

        const job = await JobModel.create(data);

        return job;
    }

    async find(id: number): Promise<Job> {

        const job = await JobModel.findOne({id: id}).exec();
            
        if (!job) {
            throw new Error(`Job with ID ${id} not found.`);
        }

        return job;
    }

}
