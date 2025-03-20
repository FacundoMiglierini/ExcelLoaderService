import mongoose, { Schema } from "mongoose";
import { Job } from "../interfaces/IJob";

export const jobSchema = new Schema<Job>({
    id: { type: String, required: true, unique: true },
    state: { type: String, required: true },
    job_errors: { type: [{"row": Number, "col": Number}] },
    file_id: { type: String, unique: true }
    },{
        timestamps: true // Enable timestamps here
});

export const JobModel = mongoose.model<Job>('Job', jobSchema);
