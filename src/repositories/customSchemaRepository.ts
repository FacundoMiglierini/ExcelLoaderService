import { ICustomSchemaRepository } from "../interfaces/ICustomSchemaRepository";

export class CustomSchemaRepository implements ICustomSchemaRepository{

    async insertMany(data: Object[], model: any): Promise<boolean> {

        const res = await model.insertMany(data);
        if (res.length !== data.length) {
            const error: any = new Error("Insert operation failed.");
            error.name = "InsertOperationFailed";
        }
        
        return true;
    }

}
