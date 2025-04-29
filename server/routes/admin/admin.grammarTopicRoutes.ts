import express from 'express';
import { grammarExerciseController } from '../../controllers/admin/admin.grammarExerciseController';
import { GrammarTopicController } from '../../controllers/admin/admin.grammarTopicController';

const router = express.Router();

// Lấy tất cả exercise trong grammar topic
router.get('/:grammarTopicId/exercises', grammarExerciseController.getExercisesByGrammarTopicId);

// GET /api/admin/exercises - Lấy tất cả exercises
router.get('/', GrammarTopicController.getAllGrammarTopics);

// GET /api/admin/exercises/:id - Lấy exercise theo ID
router.get('/:id', GrammarTopicController.findGrammarTopicById);

// POST /api/admin/exercises - Thêm mới exercise
router.post('/', GrammarTopicController.addGrammarTopic);

// PUT /api/admin/exercises/:id - Cập nhật exercise
router.put('/:id', GrammarTopicController.updateGrammarTopic);

// DELETE /api/admin/exercises/:id - Xóa exercise
router.delete('/:id', GrammarTopicController.deleteGrammarTopic);

export default router;