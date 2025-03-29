import { injectable } from "inversify";

import { IJobRepository } from "../interfaces/IJobRepository";
import { Job } from "../interfaces/IJob";
import { JobModel } from "../entities/Job";

@injectable()
export class JobRepository implements IJobRepository {

    async create(filename: string, schema: string): Promise<Job> {

        const job = await JobModel.create({
            filename: filename,
            schema: schema
        });

        return job;
    }

    async find(id: string): Promise<Job> {

        const job = await JobModel.findOne({ id: id }).exec();

        if (!job) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return job;
    }

    async updateStatus(id: string, status: string): Promise<boolean> {

        const res = await JobModel.updateOne({ id }, { status: status});

        if (!res.acknowledged) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return res.acknowledged;
    }

}
