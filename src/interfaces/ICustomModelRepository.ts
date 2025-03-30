import { Model } from "mongoose";

export interface ICustomModelRepository {
    create(collection_name: string, schema: any): Promise<Model<any>>;
    saveMany(content: Object[], model: Model<any>, force?: boolean): Promise<void>;
}

