import { Router } from 'express';
import submissionController from '../controllers/submissionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Tạo mới bài làm
router.post('/', authenticate, (req, res) => submissionController.createSubmission(req, res));

// Lấy thông tin bài làm theo ID
router.get('/:id', authenticate, (req, res) => submissionController.getSubmissionById(req, res));

// Lấy danh sách bài làm theo học viên
router.get('/learner/:learnerId', authenticate, (req, res) => submissionController.getSubmissionsByLearnerId(req, res));

// Lấy danh sách bài làm theo bài kiểm tra
router.get('/test/:testId', authenticate, (req, res) => submissionController.getSubmissionsByTestId(req, res));

// Cập nhật bài làm
router.put('/:id', authenticate, (req, res) => submissionController.updateSubmission(req, res));

// Xóa bài làm
router.delete('/:id', authenticate, (req, res) => submissionController.deleteSubmission(req, res));

export default router; 