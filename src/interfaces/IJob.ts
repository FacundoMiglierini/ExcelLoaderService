export interface Job extends Document {
    id: string;
    status: string;
    job_errors: { row: number; col: number }[];
    file_id: string;
    createdAt: Date;
    updatedAt: Date;
}
