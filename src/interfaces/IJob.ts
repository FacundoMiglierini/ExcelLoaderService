export interface Job extends Document {
    id: string;
    status: string;
    job_errors: { row: number; col: number }[];
    filename: string;
    schema: string;
}
