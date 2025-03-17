import { Job } from "./Job";

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    find(id: Number): Promise<Job>;
}
