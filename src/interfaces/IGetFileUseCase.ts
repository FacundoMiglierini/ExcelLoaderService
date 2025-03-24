export interface IGetFileUseCase {
    getFile(id: string, page: number, limit: number): any;
}
