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

    async findExcelFileRef(id: string): Promise<string> {
        const query = JobModel.findOne({ id }).select('excel_file_id');
        const job = await query.exec();

        if (!job) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return job.excel_file_id;
    }

    async findParsedFileCollection(id: string): Promise<string> {
        const query = JobModel.findOne({ id }).select('parsed_file_collection');
        const job = await query.exec();

        if (!job) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return job.parsed_file_collection;
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
       
        const res = await JobModel.updateOne({ id: id }, { $push: { job_errors: { $each: errors } } });

        if (!res.acknowledged) {
            const error: any = new Error("Job not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return res.acknowledged;
    }

}
