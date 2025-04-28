import { Request, Response } from 'express';
import { WordNoteRepository } from '../repositories/wordNoteRepository';
import WordNote from '../models/WordNote';

export class WordNoteController {

    static async createWordNote(req: Request, res: Response): Promise<Response> {
        try {
            const { title, LearnerId } = req.body;
            // Gọi repository để thêm
            const newWordNote = await WordNoteRepository.addWordNote(title, LearnerId);

            return res.status(201).json({
                success: true,
                data: newWordNote,
                message: 'Tạo WordNote thành công'
            });
        } catch (error) {
            console.error('Lỗi khi tạo WordNote:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo WordNote'
            });
        }
    }

    static async updateWordNote(req: Request, res: Response): Promise<Response> {
        const wordNoteId = parseInt(req.params.wordNoteId);
        const { title, LearnerId } = req.body; // Lấy cả learnerId nếu muốn cho phép cập nhật

        try {
            // Kiểm tra xem WordNote có tồn tại không (tùy chọn, vì repo update cũng trả null nếu ko có)
            const existingWordNote = await WordNoteRepository.findById(wordNoteId);
            if (!existingWordNote) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy WordNote để cập nhật'
                });
            }
            
            // Tạo đối tượng WordNote để cập nhật
            const noteToUpdate = new WordNote(wordNoteId, title, LearnerId); 
            
            // Cập nhật
            const updatedWordNote = await WordNoteRepository.updateWordNote(noteToUpdate);
            return res.json({
                success: true,
                data: updatedWordNote,
                message: 'Cập nhật WordNote thành công'
            });
        } catch (error) {
            console.error(`Lỗi khi cập nhật WordNote ID ${wordNoteId}:`, error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật WordNote'
            });
        }
    }

    static async deleteWordNote(req: Request, res: Response): Promise<Response> {
        const wordNoteId = parseInt(req.params.wordNoteId);
        try {
             // Kiểm tra sự tồn tại trước khi xóa (optional)
            const existingWordNote = await WordNoteRepository.findById(wordNoteId);
            if (!existingWordNote) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy WordNote để xóa'
                });
            }

            await WordNoteRepository.deleteWordNote(wordNoteId);
            return res.json({
                success: true,
                message: 'Xóa WordNote thành công'
            });
        } catch (error) {
            console.error(`Lỗi khi xóa WordNote ID ${wordNoteId}:`, error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa WordNote'
            });
        }
    }

    static async getWordNotesByLearnerId(req: Request, res: Response): Promise<Response> {
        const learnerId = parseInt(req.params.learnerId);
        try {
            const wordNotes = await WordNoteRepository.getWordNotesByLearnerId(learnerId);
            return res.json({ 
                success: true, 
                data: wordNotes,
                message: 'Lấy danh sách WordNote thành công' 
            });
        } catch (error) {
            console.error(`Lỗi khi lấy WordNote cho Learner ID ${learnerId}:`, error);
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi khi lấy danh sách WordNote' 
            });
        }
    }

    static async getWordNoteById(req: Request, res: Response): Promise<Response> {
        const wordNoteId = parseInt(req.params.wordNoteId);
        try {
            const wordNote = await WordNoteRepository.findById(wordNoteId);
            
            if (!wordNote) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Không tìm thấy WordNote' 
                });
            }

            return res.json({ 
                success: true, 
                data: wordNote,
                message: 'Lấy thông tin WordNote thành công' 
            });
        } catch (error) {
            console.error(`Lỗi khi lấy WordNote ID ${wordNoteId}:`, error);
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi khi lấy thông tin WordNote' 
            });
        }
    }
    
    static async addVocabularyToWordNote(req: Request, res: Response): Promise<Response> {
        const wordNoteId = parseInt(req.params.wordNoteId);
        const { VocabularyId } = req.body;
        try {
            await WordNoteRepository.addVocabularyToWordNote(wordNoteId, VocabularyId);
            return res.status(201).json({ 
                success: true, 
                message: 'Thêm Vocabulary vào WordNote thành công' 
            });
        } catch (error) {
            console.error(`Lỗi khi thêm Vocabulary ${VocabularyId} vào WordNote ${wordNoteId}:`, error);
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi khi thêm Vocabulary vào WordNote' 
            });
        }
    }

    static async removeVocabularyFromWordNote(req: Request, res: Response): Promise<Response> {
        const wordNoteId = parseInt(req.params.wordNoteId);
        const vocabularyId = parseInt(req.params.vocabularyId); 


        try {
            await WordNoteRepository.removeVocabularyFromWordNote(wordNoteId, vocabularyId);
            return res.json({ 
                success: true, 
                message: 'Xóa Vocabulary khỏi WordNote thành công' 
            });
        } catch (error) {
            console.error(`Lỗi khi xóa Vocabulary ${vocabularyId} khỏi WordNote ${wordNoteId}:`, error);
            return res.status(500).json({ success: false, message: 'Lỗi khi xóa Vocabulary khỏi WordNote' });
        }
    }

}
