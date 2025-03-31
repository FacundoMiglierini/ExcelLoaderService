import { injectable } from "inversify";

import { IJobRepository } from "../interfaces/IJobRepository";
import { Job } from "../interfaces/IJob";
import { JobModel } from "../entities/Job";

// Repository for interacting with Job data in MongoDB.
@injectable()
export class JobRepository implements IJobRepository {

    // Creates a new Job record with the given filename and schema.
    async create(filename: string, schema: string): Promise<Job> {

        const job = await JobModel.create({
            filename: filename,
            schema: schema
        });

        return job;
    }

    // Finds a Job record by its ID.
    async find(id: string): Promise<Job> {

        const job = await JobModel.findOne({ id }).exec();

        // If no job is found, throw a NotFoundError
        if (!job) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return job;
    }

    // Updates the status of a Job by its ID.
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
