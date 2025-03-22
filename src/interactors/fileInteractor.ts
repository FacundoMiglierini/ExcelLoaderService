import { IFileInteractor } from "../interfaces/IFileInteractor";
import { IFileRepository } from "../interfaces/IFileRepository";


export class FileInteractor implements IFileInteractor {

    private repository: IFileRepository;

    constructor(repository: IFileRepository) {
        this.repository = repository
    }

    async getFile(id: string) {

        return this.repository.find(id);
    }

}
