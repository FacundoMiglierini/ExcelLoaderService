export interface Job extends Document {
    id: string;
    status: string;
    filename: string;
    schema: string;
}
