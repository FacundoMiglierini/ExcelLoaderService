import { Model } from "mongoose";
import { ICustomSchemaRepository } from "../interfaces/ICustomSchemaRepository";
import { BATCH_SIZE } from "../config/config";

export class CustomSchemaRepository implements ICustomSchemaRepository{

    async saveBatchContent(data: Object[], model: Model<any>, force: boolean | undefined = false): Promise<void> {

        if (data.length === 0) {
            return
        }
        if (data.length >= BATCH_SIZE || force) {
            await model.insertMany(data, { ordered: false })
            data.length = 0 
        }
    }

}
