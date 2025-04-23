import { Application } from 'express';
import authRouter from './authRoutes';
import userRouter from './userRouter';
import dictionaryRoutes from './dictionaryRoutes';
import vocabularyTopicRoutes from './vocabularyTopicRoutes'
import adminVocabularyTopicRoutes from './admin/admin.vocabularyTopicRoutes'
import adminVocabularyRoutes from './admin/admin.vocabularyRoutes'
import grammarTopicTopicRoutes from './grammarTopicRoutes'
import uploadRouter from './uploadRouter';
import exerciseRouter from './exerciseRouter'
import questionRoutes from './questionRoutes';
import testRoutes from './testRoutes';
import test from './test'

function route(app: Application): void {
  app.use('/api/user', userRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/dictionary', dictionaryRoutes);
  app.use('/api/vocabulary-topic',vocabularyTopicRoutes)
  app.use('/api/admin/vocabulary-topic',adminVocabularyTopicRoutes)
  app.use('/api/admin/vocabulary',adminVocabularyRoutes)
  app.use('/api/grammar-topic',grammarTopicTopicRoutes)
  app.use('/api/upload', uploadRouter);
  app.use('/api/exercise',exerciseRouter);
  app.use('/api/question', questionRoutes);
  app.use('/api/test', testRoutes);
  app.use('/', test);
  
}

export default route;