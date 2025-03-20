import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { File } from "../interfaces/IFile";

export const fileSchema = new Schema<File>({
        id: {
            type: String,
            default: uuidv4,
            unique: true,
            required: true,
        },
        schema: { type: Object },
        data: { type: Object },
        job_id: { 
            type: String,
            ref: 'Job', 
        },
    },{
        timestamps: true // Enable timestamps here
    }
);

export const FileModel = mongoose.model<File>('File', fileSchema);
