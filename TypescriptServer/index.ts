import express, { Express, Request, Response } from 'express';
const app: Express = express();

const port: number = 5000;
app.get('/', (req: Request, res: Response) => {
  res.send('Hello TypeScript!');
}); 

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });