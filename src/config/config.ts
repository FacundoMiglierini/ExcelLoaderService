import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ensureUploadsDirectory } from '../utils/upload';

dotenv.config();

export const DEVELOPMENT = process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

export const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || '';
export const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || '';
export const DATABASE_DB = process.env.MONGO_INITDB_DATABASE || '';
export const DATABASE_HOST = process.env.DATABASE_HOST || '';
export const DATABASE_PORT = process.env.DATABASE_PORT? Number(process.env.DATABASE_PORT) : 27017;
export const DATABASE_OPTIONS: mongoose.ConnectOptions = { retryWrites: true, w: 'majority' }

export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 9000;

export const APP_SECRET = process.env.APP_SECRET || 'default';

export const BROKER_USERNAME = process.env.BROKER_USERNAME || '';
export const BROKER_PASSWORD = process.env.BROKER_PASSWORD || '';
export const BROKER_HOST = process.env.BROKER_HOST || '';
export const BROKER_PORT = process.env.BROKER_PORT? Number(process.env.BROKER_PORT) : 5672;
export const BROKER_EXCHANGE = 'excel';

export const UPLOAD_DIR = './uploads';
ensureUploadsDirectory(UPLOAD_DIR);

export const BATCH_SIZE = 1024;

export const database = {
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_DB,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_OPTIONS,
    URI: `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`
}

export const server = {
    SERVER_HOSTNAME,
    SERVER_PORT
}

export const permissions = {
    APP_SECRET: APP_SECRET
}

export const broker = {
    BROKER_EXCHANGE,
    BROKER_USERNAME,
    BROKER_PASSWORD,
    BROKER_HOST,
    BROKER_PORT,
    URI: `amqp://${BROKER_USERNAME}:${BROKER_PASSWORD}@${BROKER_HOST}:${BROKER_PORT}`
}
