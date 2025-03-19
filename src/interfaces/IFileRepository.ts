import { File } from "./IFile";

export interface IFileRepository {
    create(data: File): Promise<File>;
    find(id: Number): Promise<File>;
}
