import mongoose, { Schema } from "mongoose";
import { Job } from "../interfaces/Job";

export const jobSchema = new Schema<Job>({
    id: { type: String, required: true, unique: true },
    state: { type: String, required: true },
    job_errors: { type: [{"row": Number, "col": Number}] },
    },{
        timestamps: true // Enable timestamps here
});

export const JobModel = mongoose.model<Job>('Job', jobSchema);
