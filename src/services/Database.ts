import mongoose from "mongoose";
import { database } from "../config/config";

export default async function dbConnection() {

    try {
        const connection = await mongoose.connect(database.URI, database.DATABASE_OPTIONS);
        console.log('Connected to Mongo: ', connection.version);
    } catch (error) {
        console.log('Unnable to connect to Mongo')
        console.error(error)
    }

}
