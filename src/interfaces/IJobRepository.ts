import { Job } from "./IJob";

export interface IJobRepository {
    create(filename: string, schema: string): Promise<Job>;
    find(id: string, page?: number, limit?: number): Promise<Job>;
    findExcelFileRef(id: string): Promise<string>;
    findParsedFileCollection(id: string): Promise<string>;
    updateStatus(id: string, status: string): Promise<boolean>;
    saveBatchErrors(id: string, errors: Object[], force?: boolean): Promise<void>; //TODO use Error interface instead of object
}
