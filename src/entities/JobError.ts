import mongoose, { Schema } from "mongoose";

import { JobError } from "../interfaces/IJobError";


export const jobErrorSchema = new Schema<JobError>({
        job_id: {
            type: String, 
            required: true,
        },
        row: {
            type: Number, 
            required: true,
        },
        col: {
            type: Number, 
            required: true,
        },
    }, 
); 

export const JobErrorModel = mongoose.model<JobError>('JobError', jobErrorSchema);
