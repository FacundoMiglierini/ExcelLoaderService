import http from 'http';
import express from 'express';
import mongoose from 'mongoose';

import router from './routes';
import {server, mongo} from './config/config';


const app: express.Application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = async () => {

  app.use(express.json());

  try {
    const connection = await mongoose.connect(mongo.MONGO_CONNECTION, mongo.MONGO_OPTIONS);
    console.log('Connected to Mongo: ', connection.version);
  } catch (error) {
    console.log('Unnable to connect to Mongo')
    console.error(error)
  }

  app.use(router);

  httpServer = http.createServer(app);
  httpServer.listen(server.SERVER_PORT, () => {
    console.log(`Server started on ${server.SERVER_HOSTNAME}:${server.SERVER_PORT}`);
  })
}

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();
