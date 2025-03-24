import http from 'http';
import express from 'express';
import mongoose from 'mongoose';

import {server, database} from './config/config';
import getFileRouter from './routes/getFileRoutes';
import getJobStatusRouter from './routes/getJobStatusRoutes';
import uploadFileRouter from './routes/uploadFileRoutes';
import { consume } from './services/rabbitConsumer';


const app: express.Application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = async () => {

  app.use(express.json());

  try {
    const connection = await mongoose.connect(database.URI, database.DATABASE_OPTIONS);
    console.log('Connected to Mongo: ', connection.version);
  } catch (error) {
    console.log('Unnable to connect to Mongo')
    console.error(error)
  }

  try {
    console.log('Connected to RabbitMQ.');
    consume().catch(err => console.error("Error during consume: ", err))
  } catch (error) {
    console.log('Unnable to connect to RabbitMQ')
    console.error(error)
  }

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
