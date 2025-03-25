import { IFileRepository } from "../interfaces/IFileRepository";
import { IGetFileUseCase } from "../interfaces/IGetFileUseCase";


export class GetFileUseCase implements IGetFileUseCase {

    private repository: IFileRepository;

    constructor(repository: IFileRepository) {
        this.repository = repository
    }

    async getFile(id: string, page: number, limit: number) {
        const file = await this.repository.find(id, page, limit);

        return {
            id: file.id,
            job_id: file.job_id,
            content: file.data,
        }
    }

}
