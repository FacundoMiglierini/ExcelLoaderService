export interface Job extends Document {
    id: string;
    status: string;
    job_errors: { row: number; col: number }[];
    excel_file_id: string;
    parsed_file_collection: string;
}
