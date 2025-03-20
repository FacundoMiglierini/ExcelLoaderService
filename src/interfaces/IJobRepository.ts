import { Job } from "./IJob";

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    find(id: String): Promise<Job>;
    updateStatus(id: String, status: String): Promise<boolean>;
}
