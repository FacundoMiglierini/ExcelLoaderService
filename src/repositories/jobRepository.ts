import { IJobRepository } from "../interfaces/IJobRepository";
import { Job } from "../interfaces/IJob";
import { JobModel } from "../entities/Job";

export class JobRepository implements IJobRepository {

    async create(data: Job): Promise<Job> {

        const job = await JobModel.create(data);

        return job;
    }

    async find(id: string, page?: number, limit?: number): Promise<Job> {
        const query = JobModel.findOne({ id });
          
        if (page !== undefined && limit !== undefined) {
            query.select({
              job_errors: {
                $slice: [page - 1, limit]
              }
            });
        }

        const job = await query.exec();

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

    async updateErrors(id: string, errors: Object): Promise<boolean> {
       
        const res = await JobModel.updateOne({ id: id }, { job_errors: errors});

        if (!res.acknowledged) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return res.acknowledged;
    }


    async updateFileRef(id: string, file_id: string): Promise<boolean> {
       
        const res = await JobModel.updateOne({ id: id }, { file_id: file_id});

        if (!res.acknowledged) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return res.acknowledged;
    }

}
