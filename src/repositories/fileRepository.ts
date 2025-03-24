import { IFileRepository } from "../interfaces/IFileRepository";
import { File } from "../interfaces/IFile";
import { FileModel } from "../entities/File";

export class FileRepository implements IFileRepository {

    async create(data: File): Promise<File> {

        return await FileModel.create(data);
    }

    async find(id: string): Promise<File> {

        const file = await FileModel.findOne({id: id}).exec();
            
        if (!file) {
            const error: any = new Error("File not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return file;
    }

}
