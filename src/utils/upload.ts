import path from 'path';
import fs from 'fs';

// This function ensures that a specified directory exists. If the directory does not exist,
// it creates the directory at the given path. The path is resolved relative to the current working directory.
export const ensureUploadsDirectory = (dir: string) => {
    const uploadsDir = path.resolve(process.cwd(), dir);

    // Check if the directory exists
    if (!fs.existsSync(uploadsDir)) {
        // Create the directory
        fs.mkdirSync(uploadsDir);
        console.log(`Directory '${uploadsDir}' created.`);
    } else {
        console.log(`Directory '${uploadsDir}' already exists.`);
    }
}
