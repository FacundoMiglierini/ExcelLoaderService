import { Job } from "./IJob";

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    find(id: string, pagination?: { offset?: number; limit?: number }): Promise<Job>;
    updateStatus(id: string, status: string): Promise<boolean>;
}
