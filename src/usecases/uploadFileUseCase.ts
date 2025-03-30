import { inject, injectable } from "inversify";

import { IJobRepository } from "../interfaces/IJobRepository";
import { IUploadFileUseCase } from "../interfaces/IUploadFileUseCase";
import { publish } from "../services/Publisher";
import { schemaAsDict } from "../utils/fileProcessingUtils";
import { INTERFACE_TYPE } from "../config/config";

@injectable()
export class UploadFileUseCase implements IUploadFileUseCase {

    private jobRepository: IJobRepository;

    constructor(
        @inject(INTERFACE_TYPE.JobRepository) jobRepository: IJobRepository, 
    ) {
        this.jobRepository = jobRepository
    }

    async uploadFile(filename: string, schema: string) {

        const validatedSchema = schemaAsDict(JSON.parse(schema));
        const job = await this.jobRepository.create(filename, schema);
        console.log(`New job with id ${job.id} created.`);
        await publish(job.id, filename, validatedSchema);

        return job.id;
    }
}
