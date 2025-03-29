import { Model } from "mongoose";
import { injectable } from "inversify";

import { ICustomSchemaRepository } from "../interfaces/ICustomSchemaRepository";
import { BATCH_SIZE } from "../config/config";

@injectable()
export class CustomSchemaRepository implements ICustomSchemaRepository{

    async saveMany(data: Object[], model: Model<any>, force: boolean | undefined = false): Promise<void> {

        if (data.length === 0) {
            return
        }
        if (data.length >= BATCH_SIZE || force) {
            await model.insertMany(data, { ordered: false })
            data.length = 0 
        }
    }

}
