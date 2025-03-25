import { Job } from "./IJob";

export interface IJobRepository {
    create(data: Job): Promise<Job>;
    findStatus(id: string, page?: number, limit?: number): Promise<Job>;
    findSchema(id: string): Promise<any>;
    findRawDataLength(id: string): Promise<number>;
    findRawData(id: string, page?: number, limit?: number): Promise<any>;
    updateStatus(id: string, status: string): Promise<boolean>;
    updateErrors(id: string, errors: Object): Promise<boolean>;
    updateFileRef(id: string, file_id: string): Promise<boolean>;
}
