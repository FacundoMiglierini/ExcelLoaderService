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

    async updateStatus(id: Number, status: String): Promise<boolean> {

        const res = await JobModel.updateOne({ id: id }, { status: status});

        if (!res.acknowledged) {
            throw new Error(`Job with ID ${id} not found.`);
        }

        return res.acknowledged;
    }

}
