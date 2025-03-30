import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ensureUploadsDirectory } from '../utils/upload';

// Load environment variables from the .env file into process.env
dotenv.config();

// Flag to check if the environment is development
export const DEVELOPMENT = process.env.NODE_ENV === 'development';
// Flag to check if the environment is test
export const TEST = process.env.NODE_ENV === 'test';

// Database connection details from environment variables or default values
export const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || '';
export const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || '';
export const DATABASE_DB = process.env.MONGO_INITDB_DATABASE || '';
export const DATABASE_HOST = process.env.DATABASE_HOST || '';
export const DATABASE_PORT = process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 27017;
// Mongoose connection options
export const DATABASE_OPTIONS: mongoose.ConnectOptions = { retryWrites: true, w: 'majority' }

// Server configuration from environment variables or default values
export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 9000;

// Secret key used for application (JWT or other purposes)
export const APP_SECRET = process.env.APP_SECRET || 'default';

// Broker connection credentials and settings
export const BROKER_USERNAME = process.env.BROKER_USERNAME || '';
export const BROKER_PASSWORD = process.env.BROKER_PASSWORD || '';
export const BROKER_HOST = process.env.BROKER_HOST || '';
export const BROKER_PORT = process.env.BROKER_PORT ? Number(process.env.BROKER_PORT) : 5672;
// Exchange used in the broker
export const BROKER_EXCHANGE = 'excel';

// Directory for file uploads; ensures that directory exists
export const UPLOAD_DIR = './uploads';
// Ensures the uploads directory exists or creates it
ensureUploadsDirectory(UPLOAD_DIR);

// Size of batches for processing, e.g., for file uploads or database operations
export const BATCH_SIZE = 1024;

// Interface symbols used for dependency injection, organizing repository and controller names
export const INTERFACE_TYPE = {
    JobRepository: Symbol.for("JobRepository"),
    JobErrorRepository: Symbol.for("JobErrorRepository"),
    CustomModelRepository: Symbol.for("CustomModelRepository"),
    GetJobStatusUseCase: Symbol.for("GetJobStatusUseCase"),
    UploadFileUseCase: Symbol.for("UploadFileUseCase"),
    ProcessFileUseCase: Symbol.for("ProcessFileUseCase"),
    GetJobStatusController: Symbol.for("GetJobStatusController"),
    UploadFileController: Symbol.for("UploadFileController"),
}

// Configuration for the database, including credentials and URI
export const database = {
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_DB,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_OPTIONS,
    // URI for MongoDB connection, including credentials
    URI: `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`
}

// Configuration for the server, including hostname and port
export const server = {
    SERVER_HOSTNAME,
    SERVER_PORT
}

// Permissions-related configuration, like the app's secret key
export const permissions = {
    APP_SECRET: APP_SECRET
}

// Broker configuration, including connection URI for AMQP (e.g., RabbitMQ)
export const broker = {
    BROKER_EXCHANGE,
    BROKER_USERNAME,
    BROKER_PASSWORD,
    BROKER_HOST,
    BROKER_PORT,
    // URI for connecting to the broker
    URI: `amqp://${BROKER_USERNAME}:${BROKER_PASSWORD}@${BROKER_HOST}:${BROKER_PORT}`
}
