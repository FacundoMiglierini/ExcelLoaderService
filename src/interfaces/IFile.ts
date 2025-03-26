export interface File extends Document {
    id: string;
    name: string;
    content: Object;
    length: number;
    schema: Object;
}
