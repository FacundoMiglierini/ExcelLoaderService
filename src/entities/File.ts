import mongoose, { Schema } from "mongoose";
import { File } from "../interfaces/IFile";

export const fileSchema = new Schema<File>({
    id: { type: String, required: true, unique: true },
    job_id: { type: String, unique: true },
    schema: { type: Object },
    data: { type: Object },
    },{
        timestamps: true // Enable timestamps here
});

export const FileModel = mongoose.model<File>('File', fileSchema);
