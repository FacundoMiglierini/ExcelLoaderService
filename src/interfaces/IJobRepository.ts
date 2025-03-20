import { Job } from "./IJob";

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    find(id: string): Promise<Job>;
    updateStatus(id: string, status: string): Promise<boolean>;
}
