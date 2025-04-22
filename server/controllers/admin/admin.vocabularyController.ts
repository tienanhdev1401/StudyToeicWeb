import { Request, Response } from 'express';
import { VocabularyRepository } from '../../repositories/admin/admin.vocabularyRepository';
import { Vocabulary } from '../../models/Vocabulary';

export class VocabularyController {
 
    /**
     * Count vocabularies by topic ID
     */
    static async countVocabulariesByTopicId(req: Request, res: Response) {
        try {
            const topicId = parseInt(req.params.id);
            
            if (isNaN(topicId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid topic ID'
                });
            }
            
            const count = await VocabularyRepository.countVocabulariesByTopicId(topicId);
            
            res.status(200).json({
                success: true,
                count,
                message: 'Successfully retrieved vocabulary count'
            });
        } catch (error) {
            console.error('Error retrieving vocabulary count:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving vocabulary count'
            });
        }
    }

    /**
     * Get all vocabularies by topic ID
     */
    static async getVocabulariesByTopicId(req: Request, res: Response) {
        try {
            const topicId = parseInt(req.params.id);
            
            if (isNaN(topicId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid topic ID'
                });
            }
            
            const vocabularies = await VocabularyRepository.getVocabulariesByTopicId(topicId);
            
            res.status(200).json({
                success: true,
                data: vocabularies,
                message: 'Successfully retrieved vocabularies'
            });
        } catch (error) {
            console.error('Error retrieving vocabularies:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving vocabularies'
            });
        }
    }

    /**
     * Get vocabulary by ID
     */
    static async getVocabularyById(req: Request, res: Response) {
        try {
            const vocabularyId = parseInt(req.params.id);
            
            if (isNaN(vocabularyId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vocabulary ID'
                });
            }
            
            const vocabulary = await VocabularyRepository.getVocabularyById(vocabularyId);
            
            if (!vocabulary) {
                return res.status(404).json({
                    success: false,
                    message: 'Vocabulary not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: vocabulary,
                message: 'Successfully retrieved vocabulary'
            });
        } catch (error) {
            console.error('Error retrieving vocabulary:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving vocabulary'
            });
        }
    }
  
    /**
     * Add new vocabulary to a topic
     */
    static async addVocabulary(req: Request, res: Response) {
        try {
            const { content, meaning, synonym, transcribe, urlAudio, urlImage, VocabularyTopicId } = req.body;
            
            const topicId = parseInt(VocabularyTopicId);
            console.log("Request body:", req.body);
            console.log("Topic ID extracted:", topicId);
            
            if (isNaN(topicId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or missing VocabularyTopicId'
                });
            }
            
            if (!content || !meaning) {
                return res.status(400).json({
                    success: false,
                    message: 'Content and meaning are required fields'
                });
            }
            
            // Check for duplicate vocabulary in the same topic
            const isDuplicate = await VocabularyRepository.checkDuplicateVocabulary(content, topicId);
            if (isDuplicate) {
                return res.status(400).json({
                    success: false,
                    message: 'A vocabulary with this content already exists in this topic'
                });
            }
            
            // Xử lý synonym - đảm bảo nó là JSON hợp lệ hoặc null
            let processedSynonym = null;
            if (synonym) {
                // Nếu synonym là chuỗi nhưng không phải JSON, chuyển nó thành mảng với một phần tử
                if (typeof synonym === 'string' && (synonym.trim().charAt(0) !== '[' && synonym.trim().charAt(0) !== '{')) {
                    // Nếu synonym là chuỗi nhưng có vẻ như là phiên âm, không xử lý nó như synonym
                    if (synonym.includes('/') || synonym.trim().startsWith('/')) {
                        processedSynonym = null;
                    } else {
                        processedSynonym = JSON.stringify([synonym.trim()]);
                    }
                } else {
                    // Nếu đã là JSON string, giữ nguyên
                    try {
                        // Kiểm tra xem đã là JSON hợp lệ chưa
                        JSON.parse(synonym);
                        processedSynonym = synonym;
                    } catch (e) {
                        // Nếu không phải JSON hợp lệ, chuyển thành mảng
                        processedSynonym = JSON.stringify([synonym.trim()]);
                    }
                }
            }
            
            console.log("Processed synonym:", processedSynonym);
            
            const newVocabulary = new Vocabulary(
                0, // ID will be assigned by the database
                content,
                meaning,
                processedSynonym,
                transcribe || '',
                urlAudio || '',
                urlImage || '',
                topicId
            );
            
            const createdVocabulary = await VocabularyRepository.addVocabulary(newVocabulary, topicId);
            
            res.status(201).json({
                success: true,
                data: createdVocabulary,
                message: 'Vocabulary added successfully'
            });
        } catch (error) {
            console.error('Error adding vocabulary:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while adding vocabulary: ' + (error instanceof Error ? error.message : 'Unknown error')
            });
        }
    } 

    /**
     * Update vocabulary
     */
    static async updateVocabulary(req: Request, res: Response) {
        try {
            const vocabularyId = parseInt(req.params.id);
            
            if (isNaN(vocabularyId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vocabulary ID'
                });
            }
            
            // First, check if vocabulary exists
            const existingVocabulary = await VocabularyRepository.getVocabularyById(vocabularyId);
            
            if (!existingVocabulary) {
                return res.status(404).json({
                    success: false,
                    message: 'Vocabulary not found'
                });
            }
            
            const { content, meaning, synonym, transcribe, urlAudio, urlImage, VocabularyTopicId } = req.body;
            
            // If content is changing, check for duplicates
            if (content && content !== existingVocabulary.content) {
                const topicId = VocabularyTopicId || existingVocabulary.VocabularyTopicId;
                const isDuplicate = await VocabularyRepository.checkDuplicateVocabulary(content, topicId, vocabularyId);
                if (isDuplicate) {
                    return res.status(400).json({
                        success: false,
                        message: 'A vocabulary with this content already exists in this topic'
                    });
                }
            }
            
            // Xử lý synonym - đảm bảo nó là JSON hợp lệ hoặc null
            let processedSynonym = existingVocabulary.synonym;
            if (synonym !== undefined) {
                if (synonym === null || synonym === '') {
                    processedSynonym = null;
                } else if (typeof synonym === 'string' && (synonym.trim().charAt(0) !== '[' && synonym.trim().charAt(0) !== '{')) {
                    // Nếu synonym là chuỗi nhưng có vẻ như là phiên âm, không xử lý nó như synonym
                    if (synonym.includes('/') || synonym.trim().startsWith('/')) {
                        processedSynonym = null;
                    } else {
                        processedSynonym = JSON.stringify([synonym.trim()]);
                    }
                } else {
                    // Nếu đã là JSON string, giữ nguyên
                    try {
                        // Kiểm tra xem đã là JSON hợp lệ chưa
                        JSON.parse(synonym);
                        processedSynonym = synonym;
                    } catch (e) {
                        // Nếu không phải JSON hợp lệ, chuyển thành mảng
                        processedSynonym = JSON.stringify([synonym.trim()]);
                    }
                }
            }
            
            console.log("Processed synonym for update:", processedSynonym);
            
            // Create updated vocabulary object
            const updatedVocabulary = new Vocabulary(
                vocabularyId,
                content || existingVocabulary.content,
                meaning || existingVocabulary.meaning,
                processedSynonym,
                transcribe || existingVocabulary.transcribe,
                urlAudio || existingVocabulary.urlAudio,
                urlImage || existingVocabulary.urlImage,
                VocabularyTopicId || existingVocabulary.VocabularyTopicId
            );
            
            const result = await VocabularyRepository.updateVocabulary(updatedVocabulary);
            
            res.status(200).json({
                success: true,
                data: result,
                message: 'Vocabulary updated successfully'
            });
        } catch (error) {
            console.error('Error updating vocabulary:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while updating vocabulary: ' + (error instanceof Error ? error.message : 'Unknown error')
            });
        }
    }

    /**
     * Delete vocabulary
     */
    static async deleteVocabulary(req: Request, res: Response) {
        try {
            const vocabularyId = parseInt(req.params.id);
            
            if (isNaN(vocabularyId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vocabulary ID'
                });
            }
            
            const result = await VocabularyRepository.deleteVocabulary(vocabularyId);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Vocabulary not found or already deleted'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Vocabulary deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting vocabulary:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while deleting vocabulary'
            });
        }
    }

    /**
     * Import vocabularies from Excel file
     */
    static async importVocabulariesFromExcel(req: Request, res: Response) {
        try {
            const topicId = parseInt(req.params.topicId);
            const { vocabularies } = req.body;
            
            if (isNaN(topicId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid topic ID'
                });
            }
            
            if (!vocabularies || !Array.isArray(vocabularies) || vocabularies.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No vocabulary data provided'
                });
            }
            
            console.log(`Importing ${vocabularies.length} vocabularies for topic ID ${topicId}`);
            
            // Validate each vocabulary
            const validVocabularies = [];
            const errors = [];
            
            for (let i = 0; i < vocabularies.length; i++) {
                const vocab = vocabularies[i];
                
                if (!vocab.content || !vocab.meaning) {
                    errors.push({
                        index: i,
                        error: 'Content and meaning are required fields',
                        data: vocab
                    });
                    continue;
                }
                
                // Kiểm tra trùng lặp
                const isDuplicate = await VocabularyRepository.checkDuplicateVocabulary(vocab.content, topicId);
                if (isDuplicate) {
                    errors.push({
                        index: i,
                        error: `Vocabulary "${vocab.content}" already exists in this topic`,
                        data: vocab
                    });
                    continue;
                }
                
                // Xử lý synonym - đảm bảo nó là JSON hợp lệ hoặc null
                let processedSynonym = null;
                if (vocab.synonym) {
                    // Nếu synonym là chuỗi nhưng không phải JSON, chuyển nó thành mảng với một phần tử
                    if (typeof vocab.synonym === 'string' && (vocab.synonym.trim().charAt(0) !== '[' && vocab.synonym.trim().charAt(0) !== '{')) {
                        // Nếu synonym là chuỗi nhưng có vẻ như là phiên âm, không xử lý nó như synonym
                        if (vocab.synonym.includes('/') || vocab.synonym.trim().startsWith('/')) {
                            processedSynonym = null;
                        } else {
                            processedSynonym = JSON.stringify([vocab.synonym.trim()]);
                        }
                    } else {
                        // Nếu đã là JSON string, giữ nguyên
                        try {
                            // Kiểm tra xem đã là JSON hợp lệ chưa
                            JSON.parse(vocab.synonym);
                            processedSynonym = vocab.synonym;
                        } catch (e) {
                            // Nếu không phải JSON hợp lệ, chuyển thành mảng
                            processedSynonym = JSON.stringify([vocab.synonym.trim()]);
                        }
                    }
                }
                
                // Tạo đối tượng Vocabulary
                const newVocab = new Vocabulary(
                    0, // ID sẽ được gán bởi database
                    vocab.content,
                    vocab.meaning,
                    processedSynonym,
                    vocab.transcribe || '',
                    vocab.urlAudio || '',
                    vocab.urlImage || '',
                    topicId
                );
                
                validVocabularies.push(newVocab);
            }
            
            // Thêm các từ vựng hợp lệ vào database
            const results = await VocabularyRepository.addMultipleVocabularies(validVocabularies, topicId);
            
            // Trả về kết quả
            res.status(200).json({
                success: true,
                message: `Successfully imported ${results.length} out of ${vocabularies.length} vocabularies`,
                data: {
                    imported: results,
                    errors: errors
                }
            });
        } catch (error) {
            console.error('Error importing vocabularies from Excel:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while importing vocabularies: ' + (error instanceof Error ? error.message : 'Unknown error')
            });
        }
    }
}

export default new VocabularyController();