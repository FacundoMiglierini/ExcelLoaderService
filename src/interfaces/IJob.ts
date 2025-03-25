export interface Job extends Document {
    id: string;
    status: string;
    schema: Object;
    raw_data_length: number;
    raw_data: Object;
    job_errors: { row: number; col: number }[];
    file_id: string;
}
