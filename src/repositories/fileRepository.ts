import { IFileRepository } from "../interfaces/IFileRepository";
import { File } from "../interfaces/IFile";
import { FileModel } from "../entities/File";

export class FileRepository implements IFileRepository {

    async create(data: File): Promise<File> {

        return await FileModel.create(data);
    }

    async find(id: string, page?: number, limit?: number): Promise<File> {

        const query = FileModel.findOne({id: id});

        if (page !== undefined && limit !== undefined) {
            query.select({
              data: {
                $slice: [page - 1, limit]
              }
            });
        }

        const file = await query.exec();
            
        if (!file) {
            const error: any = new Error("File not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return file;
    }

    async updateContent(id: string, content: any): Promise<boolean> {

        const res = await FileModel.updateOne({ id: id }, { $push: { data: content } });

        if (!res.acknowledged) {
            const error: any = new Error("File not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return res.acknowledged;
    }

}
