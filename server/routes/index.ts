import { Application } from 'express';
import authRouter from './authRoutes';
import userRouter from './userRouter';
import dictionaryRoutes from './dictionaryRoutes';
import vocabularyTopicRoutes from './vocabularyTopicRoutes'
import adminVocabularyTopicRoutes from './admin/admin.vocabularyTopicRoutes'
import adminVocabularyRoutes from './admin/admin.vocabularyRoutes'
import adminTestRoutes from './admin/admin.testRoutes'
import grammarTopicTopicRoutes from './grammarTopicRoutes'
import adminLearnerRoutes from './admin/admin.LearnerRoutes'
import adminStaffRoutes from './admin/admin.StaffRoutes'
import adminExerciseRoutes from './admin/admin.exercisesRoutes'
import adminExerciseQuestionRoutes from './admin/admin.exercisesQuestionRoutes'
import adminExerciseGrammarRoutes from './admin/admin.exercisegrammarRoutes'
import adminExerciseVocabularyRoutes from './admin/admin.exercisevocabularyRoutes'
import adminGrammarTopicRoutes from './admin/admin.grammarTopicRoutes'
import uploadRouter from './uploadRouter';
import exerciseRouter from './exerciseRouter'
import learningRouter from './learningGoalRouter'
import commentRoutes from './commentRoutes'
import wordNoteRoutes from './wordNoteRoutes'
import questionRoutes from './questionRoutes';
import testRoutes from './testRoutes';
import submissionRoutes from './submissionRoutes';
import roadmapRoutes from './roadmapRoutes';
import test from './test'
import adminQuestionRoutes from './admin/admin.questionRoutes';
import adminResourceRoutes from './admin/admin.resourceRoutes';
import adminRoadmapConfigRoutes from './admin/admin.roadmapConfigRoutes';
import learningProcessRoutes from './learningProcessRoutes';
import lessonRoutes from './lessonRoutes';
import adminLessonRoutes from './admin/admin.lessonRoutes';
import adminblogRoutes from './admin/admin.blogRoutes'

function route(app: Application): void {
  app.use('/api/user', userRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/dictionary', dictionaryRoutes);
  app.use('/api/vocabulary-topic',vocabularyTopicRoutes)
  app.use('/api/admin/vocabulary-topic',adminVocabularyTopicRoutes)
  app.use('/api/admin/vocabulary',adminVocabularyRoutes)
  app.use('/api/admin/test', adminTestRoutes)
  app.use('/api/admin/question', adminQuestionRoutes)
  app.use('/api/admin/resource',adminResourceRoutes )
  app.use('/api/grammar-topic',grammarTopicTopicRoutes)
  app.use('/api/admin/learner',adminLearnerRoutes)
  app.use('/api/admin/staff',adminStaffRoutes)
  app.use('/api/admin/exercise',adminExerciseRoutes)
  app.use('/api/admin/exercises',adminExerciseQuestionRoutes)
  app.use('/api/admin/exercisess/grammars',adminExerciseGrammarRoutes)
  app.use('/api/admin/exercisesss/vocabularies',adminExerciseVocabularyRoutes)
  app.use('/api/admin/grammar',adminGrammarTopicRoutes)
  app.use('/api/upload', uploadRouter);
  app.use('/api/exercise',exerciseRouter);
  app.use('/api/learning-goal',learningRouter)
  app.use('/api/roadmap', roadmapRoutes);
  app.use('/api/comment', commentRoutes);
  app.use('/api/wordnote', wordNoteRoutes);
  app.use('/api/exercise',exerciseRouter);
  app.use('/api/question', questionRoutes);
  app.use('/api/test', testRoutes);
  app.use('/api/admin/exercise', adminExerciseRoutes);
  app.use('/api/admin/exercise/', adminExerciseQuestionRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/admin/lessons', adminLessonRoutes);
  app.use('/api/admin/blog', adminblogRoutes);

  
  app.use('/api/submissions', submissionRoutes);
  app.use('/', test);
  app.use('/api/admin/roadmap-config', adminRoadmapConfigRoutes);
  app.use('/api/learning-process', learningProcessRoutes);
}

export default route;