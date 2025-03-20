import { IJobRepository } from "../interfaces/IJobRepository";
import { Job } from "../interfaces/IJob";
import { JobModel } from "../entities/Job";

export class JobRepository implements IJobRepository {

    async create(data: Job): Promise<Job> {

        const job = await JobModel.create(data);

        return job;
    }

    async find(id: string): Promise<Job> {

        const job = await JobModel.findOne({id: id}).exec();
            
        if (!job) {
            throw new Error(`Job with ID ${id} not found.`);
        }

        return job;
    }

    async updateStatus(id: string, status: string): Promise<boolean> {

        const res = await JobModel.updateOne({ id: id }, { status: status});

        if (!res.acknowledged) {
            throw new Error(`Job with ID ${id} not found.`);
        }

        return res.acknowledged;
    }

    async updateErrors(id: string, errors: Object): Promise<boolean> {
       
        const res = await JobModel.updateOne({ id: id }, { job_errors: errors});

        if (!res.acknowledged) {
            throw new Error(`Job with ID ${id} not found.`);
        }

        return res.acknowledged;
    }

}
