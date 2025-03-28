import { Model } from "mongoose";

export interface ICustomSchemaRepository {
    saveMany(content: Object[], model: Model<any>, force?: boolean): Promise<void>;
}

