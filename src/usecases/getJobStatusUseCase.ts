import { inject, injectable } from "inversify";

import JobStatus from "../enums/Job";
import { IGetJobStatusUseCase } from "../interfaces/IGetJobStatusUseCase";
import { IJobErrorRepository } from "../interfaces/IJobErrorRepository";
import { IJobRepository } from "../interfaces/IJobRepository";
import { INTERFACE_TYPE } from "../config/config";


// Use Case responsible for fetching job status and its errors, with pagination for the errors
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

    // Method to fetch job status and its errors, with pagination for the errors
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
