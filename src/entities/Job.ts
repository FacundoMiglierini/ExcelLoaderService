import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { Job } from "../interfaces/IJob";
import JobStatus from "../enums/Job";


export const jobSchema = new Schema<Job>({
        id: {
            type: String,
            default: uuidv4,
            unique: true,
            required: [true, 'ID is required'],
        },
        status: {
            type: String,
            enum: Object.values(JobStatus),
            default: JobStatus.PENDING,
            required: [true, 'Status is required'],
        },
        filename: { 
            type: String,
            required: [true, 'Filename is required'],
        },
        schema: {
            type: String,
            required: [true, 'Schema is required'],
        }
    },{
        timestamps: true 
    }
);


export const JobModel = mongoose.model<Job>('Job', jobSchema);
