import { IGetJobStatusUseCase } from "../interfaces/IGetJobStatusUseCase";
import { IJobRepository } from "../interfaces/IJobRepository";

export class GetJobStatusUseCase implements IGetJobStatusUseCase {

    private repository: IJobRepository;

    constructor(repository: IJobRepository) {
        this.repository = repository
    }

    async getJobStatus(id: string, page: number, limit: number ) {

        const job = await this.repository.find(id, page, limit);

        return {
            id: job.id,
            status: job.status,
            ...(job.parsed_file_collection !== null && { file_collection: job.parsed_file_collection }),
            errors: job.job_errors,
        }
    }

}
