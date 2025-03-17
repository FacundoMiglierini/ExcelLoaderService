import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const DEVELOPMENT = process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

export const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || '';
export const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || '';
export const DATABASE_DB = process.env.MONGO_INITDB_DATABASE || '';
export const DATABASE_HOST = process.env.DATABASE_HOST || '';
export const DATABASE_PORT = process.env.DATABASE_PORT || '';
export const DATABASE_COLLECTION = process.env.DATABASE_COLLECTION || '';
export const DATABASE_OPTIONS: mongoose.ConnectOptions = { retryWrites: true, w: 'majority' }

export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 9000;

export const database = {
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_DB,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_COLLECTION,
    DATABASE_OPTIONS,
    URI: `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`
}

export const server = {
    SERVER_HOSTNAME,
    SERVER_PORT
}


