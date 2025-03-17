export interface Job extends Document {
    id: string;
    state: string;
    job_errors: { row: number; col: number }[];
    createdAt: Date;
    updatedAt: Date;
}
