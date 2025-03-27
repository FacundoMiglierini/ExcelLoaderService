import { Job } from "./IJob";

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    find(id: string, page?: number, limit?: number): Promise<Job>;
    findExcelFileRef(id: string): Promise<string>;
    findParsedFileCollection(id: string): Promise<string>;
    updateStatus(id: string, status: string): Promise<boolean>;
    updateErrors(id: string, errors: Object): Promise<boolean>;
}
