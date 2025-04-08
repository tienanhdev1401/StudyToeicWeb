import { Application } from 'express';
import authRouter from './authRoutes';
import userRouter from './userRouter';
import test from './test'
function route(app: Application): void {
  app.use('/api/user', userRouter);
  app.use('/api/auth', authRouter);
  app.use('/', test);
}

export default route;
