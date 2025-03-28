import path from 'path';
import fs from 'fs';


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
