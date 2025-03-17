import mongoose, { Schema } from "mongoose";

export const jobSchema = new Schema({
    id: { type: String, required: true, unique: true },
    state: { type: String, required: true },
    errors: { type: [{"row": Number, "col": Number}] },
    timestamps: { createdAt: true },
})

export const Job = mongoose.model('Job', jobSchema);
