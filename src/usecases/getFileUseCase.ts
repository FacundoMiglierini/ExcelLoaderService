import { IFileRepository } from "../interfaces/IFileRepository";
import { IGetFileUseCase } from "../interfaces/IGetFileUseCase";


export class GetFileUseCase implements IGetFileUseCase {

    private repository: IFileRepository;

    constructor(repository: IFileRepository) {
        this.repository = repository
    }

    async getFile(id: string) {
        return this.repository.find(id);
    }

}
