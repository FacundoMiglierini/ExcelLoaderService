export interface ICustomSchemaRepository {
    saveBatchContent(batchContent: Object[], model: Object, force: boolean): Promise<boolean>;
}

