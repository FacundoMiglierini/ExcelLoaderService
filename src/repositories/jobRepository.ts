import { IJobRepository } from "../interfaces/IJobRepository";

export class JobRepository implements IJobRepository {
    create(data: Job): Promise<Job> {
        throw new Error("Method not implemented");
    }

    find(id: number): Promise<Job> {
        throw new Error("Method not implemented");
    }
}
