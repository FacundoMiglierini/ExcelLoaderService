import { inject, injectable } from "inversify";

import JobStatus from "../enums/Job";
import { IGetJobStatusUseCase } from "../interfaces/IGetJobStatusUseCase";
import { IJobErrorRepository } from "../interfaces/IJobErrorRepository";
import { IJobRepository } from "../interfaces/IJobRepository";
import { INTERFACE_TYPE } from "../config/config";

@injectable()
export class GetJobStatusUseCase implements IGetJobStatusUseCase {

    private jobRepository: IJobRepository;
    private jobErrorRepository: IJobErrorRepository;

    constructor(
        @inject(INTERFACE_TYPE.JobRepository) jobRepository: IJobRepository, 
        @inject(INTERFACE_TYPE.JobErrorRepository) jobErrorRepository: IJobErrorRepository
    ) {
        this.jobRepository = jobRepository
        this.jobErrorRepository = jobErrorRepository
    }

    async getJobStatus(id: string, page: number, limit: number ) {

        const job = await this.jobRepository.find(id);
        const errors = await this.jobErrorRepository.find(id, page, limit);

        return {
            id: job.id,
            status: job.status,
            ...(job.status === JobStatus.DONE && { file_collection: job.filename }),
            errors: errors,
        }
    }

}
