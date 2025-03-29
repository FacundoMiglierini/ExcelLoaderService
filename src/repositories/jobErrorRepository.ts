import { injectable } from "inversify";
import { BATCH_SIZE } from "../config/config";
import { JobErrorModel } from "../entities/JobError";
import { JobError } from "../interfaces/IJobError";
import { IJobErrorRepository } from "../interfaces/IJobErrorRepository";

@injectable()
export class JobErrorRepository implements IJobErrorRepository {


    async find(id: string, page: number, limit: number) {

        // Calculate skip value based on page and limit
        const skip = (page - 1) * limit;

        // Perform the query
        const results = await JobErrorModel.find({ job_id: id })
            .select('row col -_id')
            .sort({ row: 1, col: 1 }) 
            .skip(skip) 
            .limit(limit)
            .exec();

        return results;
    }

    async saveMany(errors: JobError[], force: boolean | undefined = false): Promise<void> {

        if (errors.length === 0) {
            return
        }
        if (errors.length >= BATCH_SIZE || force) {
            await JobErrorModel.insertMany(errors, { ordered: false } )
            errors.length = 0 
        }
    }
}
