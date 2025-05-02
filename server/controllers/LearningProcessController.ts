import { Request, Response } from 'express';
import { LearningProcessRepository } from '../repositories/LearningProcessRepository';

export class LearningProcessController {
    /**
     * Lấy tất cả quá trình học tập của một user
     */
    static async getAllLearningProcessByUserId(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID người dùng không hợp lệ'
                });
            }

            const processes = await LearningProcessRepository.getAllLearningProcessByUserId(userId);

            res.status(200).json({
                success: true,
                data: processes,
                message: 'Lấy danh sách quá trình học tập thành công'
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quá trình học tập:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách quá trình học tập'
            });
        }
    }

    /**
     * Tạo hoặc cập nhật trạng thái học tập thành "in_progress"
     */
    static async setLearningProcessInProgress(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);
            const { grammarTopicId, testId, vocabularyTopicId } = req.body;

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID người dùng không hợp lệ'
                });
            }

            const learningProcess = await LearningProcessRepository.setLearningProcessInProgress(
                userId,
                { grammarTopicId, testId, vocabularyTopicId }
            );

            res.status(200).json({
                success: true,
                data: learningProcess,
                message: 'Cập nhật trạng thái học tập thành công'
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái học tập:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi cập nhật trạng thái học tập'
            });
        }
    }

    /**
     * Cập nhật trạng thái học tập thành "completed"
     */
    static async setLearningProcessCompleted(req: Request, res: Response) {
        try {
            const processId = parseInt(req.params.processId);
            
            if (isNaN(processId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID quá trình học tập không hợp lệ'
                });
            }

            const isCompleted = await LearningProcessRepository.setLearningProcessCompleted(processId);

            if (!isCompleted) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể hoàn thành quá trình học tập. Có thể quá trình chưa bắt đầu hoặc đã hoàn thành.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái hoàn thành thành công'
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái hoàn thành:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi cập nhật trạng thái hoàn thành'
            });
        }
    }

    /**
     * Lấy thống kê học tập của user
     */
    static async getLearningStatistics(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);
            
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID người dùng không hợp lệ'
                });
            }

            const statistics = await LearningProcessRepository.getLearningStatistics(userId);

            res.status(200).json({
                success: true,
                data: statistics,
                message: 'Lấy thống kê học tập thành công'
            });
        } catch (error) {
            console.error('Lỗi khi lấy thống kê học tập:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy thống kê học tập'
            });
        }
    }
}

export default new LearningProcessController(); 