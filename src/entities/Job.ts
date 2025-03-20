import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Job } from "../interfaces/IJob";

enum JobStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    DONE = "done"
}

export const jobSchema = new Schema<Job>({
        id: {
            type: String,
            default: uuidv4,
            unique: true,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(JobStatus),
            default: JobStatus.PENDING,
            required: true,
        },
        job_errors: { 
            type: [{
                row: Number, 
                col: Number
            }],
            default: [],
        },
        file_id: { 
            type: String,
            ref: 'File', 
        },
    },{
        timestamps: true // Enable timestamps here
    }
);



export const JobModel = mongoose.model<Job>('Job', jobSchema);
export default JobStatus;
