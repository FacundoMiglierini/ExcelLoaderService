import { File } from "./IFile";

export interface IFileRepository {
    create(data: File): Promise<File>;
    findContent(id: string, page: number, limit: number): Promise<Object>;
    findContentLength(id: string): Promise<number>;
    findSchema(id: string): Promise<Object>;
}
