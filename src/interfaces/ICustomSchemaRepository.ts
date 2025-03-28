import { Model } from "mongoose";

export interface ICustomSchemaRepository {
    saveBatchContent(batchContent: Object[], model: Model<any>, force?: boolean): Promise<void>;
}

