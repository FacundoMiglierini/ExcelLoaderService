import { IFileRepository } from "../interfaces/IFileRepository";
import { File } from "../interfaces/IFile";
import { FileModel } from "../entities/File";

export class FileRepository implements IFileRepository {

    async create(data: File): Promise<File> {

        return await FileModel.create(data);
    }

    async findContent(id: string, page: number, limit: number): Promise<Object> {

        const query = FileModel.findOne({id: id}).select('content');

        if (page !== undefined && limit !== undefined) {
            const skip = (page - 1) * limit;
            query.select({
              content: {
                $slice: [skip, limit]
              }
            });
        }

        const file = await query.exec();
            
        if (!file) {
            const error: any = new Error("File not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return file.content;
    }

    async findContentLength(id: string): Promise<number> {
        const query = FileModel.findOne({ id });
        query.select('length'); 
        const file = await query.exec();

        if (!file) {
            const error: any = new Error("File not found.");
            error.name = "NotFoundError"; 
            throw error;
        }

        return file.length;
    }

    async findSchema(id: string): Promise<Object> {
        const query = FileModel.findOne({ id });
        query.select('schema'); 
        const file = await query.exec();

        if (!file) {
            const error: any = new Error("File not found");
            error.name = "NotFoundError"; 
            throw error;
        }

        return file.schema;
    }

}
