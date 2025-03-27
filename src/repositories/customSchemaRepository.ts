import { ICustomSchemaRepository } from "../interfaces/ICustomSchemaRepository";

export class CustomSchemaRepository implements ICustomSchemaRepository{

    async saveBatchContent(data: Object[], model: any, force: boolean | undefined = false): Promise<boolean> {

        const res = await model.insertMany(data, { ordered: false });
        if (res.length !== data.length) {
            const error: any = new Error("Insert operation failed.");
            error.name = "InsertOperationFailed";
        }
        
        return true;
    }

}
