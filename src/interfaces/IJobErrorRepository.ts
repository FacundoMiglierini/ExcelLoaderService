import { JobError } from "./IJobError";

export interface IJobErrorRepository {
    find(id: string, page: number, limit: number): Promise<JobError[]>;
    saveMany(errors: JobError[], force?: boolean): Promise<void>; 
}
