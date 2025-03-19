import { Job } from "./IJob";

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    find(id: Number): Promise<Job>;
    updateStatus(id: Number, status: String): Promise<boolean>;
}
