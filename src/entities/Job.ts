import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { Job } from "../interfaces/IJob";
import JobStatus from "../enums/Job";


const jobErrorSchema = new mongoose.Schema({
  row: Number,
  col: Number
}, { _id: false }); 

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
            type: [jobErrorSchema], 
            default: [],
        },
        excel_file_id: { 
            type: String,
            ref: 'File', 
        },
        parsed_file_id: {
            type: String,
            ref: 'File', //TODO use another schema as ref
        }
    },{
        timestamps: true 
    }
);


export const JobModel = mongoose.model<Job>('Job', jobSchema);
