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
        name: {
            type: String,
            default: 'unamed.xlsx'
        },
        content: { type: Object },
        length: { type: Number },
        schema: { type: Object },
    },{
        timestamps: true 
    }
);

export const FileModel = mongoose.model<File>('File', fileSchema);
