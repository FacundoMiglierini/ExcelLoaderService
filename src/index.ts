import express, { Request, Response } from 'express';

const app: express.Application = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hola');
});

app.listen(3500, () => {
  console.log('Listening on http://localhost:3500');
});
