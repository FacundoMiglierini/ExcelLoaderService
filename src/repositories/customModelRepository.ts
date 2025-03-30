import mongoose, { Model, Schema } from "mongoose";
import { injectable } from "inversify";

import { ICustomModelRepository } from "../interfaces/ICustomModelRepository";
import { BATCH_SIZE } from "../config/config";
import { SchemaDataTypes } from "../enums/DataTypes";
import { mapToMongooseSchema } from "../utils/fileProcessingUtils";

@injectable()
export class CustomModelRepository implements ICustomModelRepository{

    async create(collection_name: string, schema: any): Promise<Model<any>> {

        const mongooseSchema = mapToMongooseSchema({ row: { type: SchemaDataTypes.NUMBER, unique: true }, ...schema});
        const schemaObject = new Schema(mongooseSchema);

        return mongoose.model(collection_name, schemaObject);
    }

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
