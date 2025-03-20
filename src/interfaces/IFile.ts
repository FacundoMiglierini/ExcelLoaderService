export interface File extends Document {
    id: string;
    schema: Object;
    data: Object;
    job_id: string;
    createdAt: Date;
    updatedAt: Date;
}
