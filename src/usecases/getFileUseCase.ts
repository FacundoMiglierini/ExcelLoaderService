import { IFileRepository } from "../interfaces/IFileRepository";
import { IGetFileUseCase } from "../interfaces/IGetFileUseCase";


export class GetFileUseCase implements IGetFileUseCase {

    private repository: IFileRepository;

    constructor(repository: IFileRepository) {
        this.repository = repository
    }

    async getFile(id: string) {
        const file = await this.repository.find(id);

        if (!file) {
            const error: any = new Error("File not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return {
            id: file.id,
            job_id: file.job_id,
            content: file.data,
        }
    }

}
