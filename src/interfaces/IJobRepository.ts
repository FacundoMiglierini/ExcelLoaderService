import { Job } from "./IJob";

export interface IJobRepository {
    create(filename: string, schema: string): Promise<Job>;
    find(id: string): Promise<Job>;
    updateStatus(id: string, status: string): Promise<boolean>;
}
