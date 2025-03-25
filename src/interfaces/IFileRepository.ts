import { File } from "./IFile";

export interface IFileRepository {
    create(data: File): Promise<File>;
    find(id: string, page: number, limit: number): Promise<File>;
    updateContent(id: string, content: any): Promise<boolean>;
}
