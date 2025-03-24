import { IJobRepository } from "../interfaces/IJobRepository";
import { Job } from "../interfaces/IJob";
import { JobModel } from "../entities/Job";

export class JobRepository implements IJobRepository {

    async create(data: Job): Promise<Job> {

        const job = await JobModel.create(data);

        return job;
    }

    async findStatus(id: string, page?: number, limit?: number): Promise<Job> {
        const query = JobModel.findOne({ id });
          
        if (page !== undefined && limit !== undefined) {
            const skip = (page - 1) * limit;
            query.select({
              job_errors: {
                $slice: [skip, limit]
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


    async findSchema(id: string): Promise<Object> {
        const query = JobModel.findOne({ id });
        query.select('schema'); 
        const schema = await query.exec();

        if (!schema) {
            const error: any = new Error("Schema not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return schema.schema;
    }

    async findRawDataLength(id: string): Promise<number> {
        const query = JobModel.findOne({ id });
        query.select('raw_data_length'); 
        const length = await query.exec();

        if (!length) {
            const error: any = new Error("Raw data length not found.");
            error.name = "NotFoundError"; 
            throw error;
        }

        return length.raw_data_length;
    }

    async findRawData(id: string, page: number, limit: number): Promise<Object> {
        const query = JobModel.findOne({ id });
          
        query.select({
          raw_data: {
            $slice: [page - 1, limit]
          }
        });

        const job = await query.exec();

        if (!job) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return job.raw_data;
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
       
        const res = await JobModel.updateOne({ id: id }, { $push: { job_errors: errors } });

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
