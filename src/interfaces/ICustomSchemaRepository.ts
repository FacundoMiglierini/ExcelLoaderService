export interface ICustomSchemaRepository {
    insertMany(data: Object[], model: Object): Promise<boolean>;
}

