import { File } from "./IFile";

export interface IFileRepository {
    create(data: File): Promise<File>;
    find(id: string): Promise<File>;
}
