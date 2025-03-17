import { IJobInteractor } from "../interfaces/IJobInteractor";
import { IJobRepository } from "../interfaces/IJobRepository";

export class JobInteractor implements IJobInteractor {

    private repository: IJobRepository;

    constructor(repository: IJobRepository) {
        this.repository = repository
    }

    async createJob(input: any) {
        return this.repository.create(input);
    }

    async getJobStatus(id: Number) {
        return this.repository.find(id);
    }
}
