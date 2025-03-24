import { IGetJobStatusUseCase } from "../interfaces/IGetJobStatusUseCase";
import { IJobRepository } from "../interfaces/IJobRepository";

export class GetJobStatusUseCase implements IGetJobStatusUseCase {

    private repository: IJobRepository;

    constructor(repository: IJobRepository) {
        this.repository = repository
    }

    async getJobStatus(id: string, page: number, limit: number ) {

        const job = await this.repository.findStatus(id, page, limit);

        return {
            id: job.id,
            status: job.status,
            ...(job.file_id !== null && { file_id: job.file_id }),
            errors: job.job_errors,
        }
    }

}
