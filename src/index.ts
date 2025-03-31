import http from 'http';
import express from 'express';
import "reflect-metadata";

import { server } from './config/config';
import getJobStatusRouter from './routes/getJobStatusRoutes';
import uploadFileRouter from './routes/uploadFileRoutes';
import dbConnection from './services/Database';
import brokerConsumerConnection from './services/Consumer';


export const app: express.Application = express();
export let httpServer: ReturnType<typeof http.createServer>;

// This is the main entry point of the application. It initializes the Express application, 
// connects to the database, and sets up the broker consumer connection.
// It also sets up the routes and starts the HTTP server on the specified hostname and port.
export const Main = async () => {

    app.use(express.json());

    await dbConnection();
    await brokerConsumerConnection();

    app.use(getJobStatusRouter);
    app.use(uploadFileRouter);

    httpServer = http.createServer(app);
    httpServer.listen(server.SERVER_PORT, () => {
        console.log(`Server started on ${server.SERVER_HOSTNAME}:${server.SERVER_PORT}`);
    })
}

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();
