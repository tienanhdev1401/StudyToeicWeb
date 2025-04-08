import { Application } from 'express';
import authRouter from './authRoutes';
import userRouter from './userRouter';

function route(app: Application): void {
  app.use('/api/user', userRouter);
  app.use('/api/auth', authRouter);
}

export default route;
