import { Job } from '../entities/Job';

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    find(id: number): Promise<Job>;
}
