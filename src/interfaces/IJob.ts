export interface Job extends Document {
    id: string;
    status: string;
    job_errors: { row: number; col: number }[];
    excel_file_id: string;
    parsed_file_id: string;
    //schema: Object;
    //raw_data_length: number;
    //raw_data: Object;
    //file_id: string;
}
