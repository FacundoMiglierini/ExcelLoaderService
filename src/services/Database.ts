import mongoose from "mongoose";
import { database } from "../config/config";

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * If the connection is successful, it logs the MongoDB version.
 * If there is an error, it logs the error message.
 */
export default async function dbConnection() {

    try {
        const connection = await mongoose.connect(database.URI, database.DATABASE_OPTIONS);
        console.log('Connected to Mongo: ', connection.version);
    } catch (error) {
        console.log('Unnable to connect to Mongo')
        console.error(error)
    }

}
