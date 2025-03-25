import http from 'http';
import express from 'express';

import { server } from './config/config';
import getFileRouter from './routes/getFileRoutes';
import getJobStatusRouter from './routes/getJobStatusRoutes';
import uploadFileRouter from './routes/uploadFileRoutes';
import dbConnection from './services/Database';
import brokerConsumerConnection from './services/Consumer';


export const app: express.Application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = async () => {

    app.use(express.json());

    await dbConnection();
    await brokerConsumerConnection();

    app.use(getJobStatusRouter);
    app.use(getFileRouter);
    app.use(uploadFileRouter);

    httpServer = http.createServer(app);
    httpServer.listen(server.SERVER_PORT, () => {
        console.log(`Server started on ${server.SERVER_HOSTNAME}:${server.SERVER_PORT}`);
    })
}

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();
