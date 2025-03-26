import { Job } from "./IJob";

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    find(id: string, page?: number, limit?: number): Promise<Job>;
    updateStatus(id: string, status: string): Promise<boolean>;
    updateErrors(id: string, errors: Object): Promise<boolean>;
    updateParsedFileRef(id: string, ref: string): Promise<boolean>;
}
