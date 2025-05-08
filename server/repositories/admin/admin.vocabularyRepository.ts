import database from '../../config/db';
import { Vocabulary } from '../../models/Vocabulary';

export class VocabularyRepository {
    static async countVocabulariesByTopicId(topicId: number): Promise<number> {
        const results = await database.query(
            'SELECT COUNT(*) as count FROM vocabularies WHERE VocabularyTopicId = ?',
            [topicId]
        );
        return results[0].count;
    }

    static async getVocabulariesByTopicId(topicId: number): Promise<Vocabulary[] | null> {
        const results = await database.query(
            'SELECT * FROM vocabularies WHERE VocabularyTopicId = ?',
            [topicId]
        );
   
       
        const vocabularies = results.map((row: any) => new Vocabulary(
            row.id,
            row.content,
            row.meaning,
            row.synonym ? JSON.parse(row.synonym) : null,   
            row.transcribe,
            row.urlAudio,
            row.urlImage,
            row.VocabularyTopicId
        ));
        return vocabularies;
    }

    static async getVocabularyById(id: number): Promise<Vocabulary | null> {
        const results = await database.query(
            'SELECT * FROM vocabularies WHERE id = ?',
            [id]
        );

        if (results.length === 0) {
            return null;
        }

        const row = results[0];
        return new Vocabulary(
            row.id,
            row.content,
            row.meaning,
            row.synonym ? JSON.parse(row.synonym) : null,
            row.transcribe,
            row.urlAudio,
            row.urlImage,
            row.VocabularyTopicId
        );
    }

    static async addVocabulary(vocabulary: Vocabulary, topicId: number): Promise<Vocabulary> {
        const results = await database.query(
            'INSERT INTO vocabularies (content, meaning, synonym, transcribe, urlAudio, urlImage, VocabularyTopicId) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [vocabulary.content, vocabulary.meaning, vocabulary.synonym, vocabulary.transcribe, vocabulary.urlAudio, vocabulary.urlImage, topicId]
        );
        
        // Set the ID of the newly created vocabulary
        vocabulary.id = results.insertId;
        return vocabulary;
    }       

    static async updateVocabulary(vocabulary: Vocabulary): Promise<Vocabulary> {
        const results = await database.query(
            'UPDATE vocabularies SET content = ?, meaning = ?, synonym = ?, transcribe = ?, urlAudio = ?, urlImage = ?, VocabularyTopicId = ? WHERE id = ?',
            [vocabulary.content, vocabulary.meaning, vocabulary.synonym, vocabulary.transcribe, vocabulary.urlAudio, vocabulary.urlImage, vocabulary.VocabularyTopicId, vocabulary.id]
        );
        return vocabulary;
    }

    static async deleteVocabulary(id: number): Promise<boolean> {
        const results = await database.query(
            'DELETE FROM vocabularies WHERE id = ?',
            [id]
        );
        return results.affectedRows > 0;
    }   

    static async checkDuplicateVocabulary(content: string, topicId: number, excludeId?: number): Promise<boolean> {
        let query = 'SELECT COUNT(*) as count FROM vocabularies WHERE content = ? AND VocabularyTopicId = ?';
        let params = [content, topicId];
        
        // If updating, exclude the current vocabulary ID from the check
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const results = await database.query(query, params);
        return results[0].count > 0;
    }

     /**
     * Thêm nhiều từ vựng cùng lúc
     */
     static async addMultipleVocabularies(vocabularies: Vocabulary[], topicId: number): Promise<Vocabulary[]> {
        const results: Vocabulary[] = [];
        
        // Sử dụng transaction để đảm bảo tính toàn vẹn
        try {
            await database.query('START TRANSACTION');
            
            for (const vocabulary of vocabularies) {
                const queryResult = await database.query(
                    'INSERT INTO vocabularies (content, meaning, synonym, transcribe, urlAudio, urlImage, VocabularyTopicId) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [vocabulary.content, vocabulary.meaning, vocabulary.synonym, vocabulary.transcribe, vocabulary.urlAudio, vocabulary.urlImage, topicId]
                );
                
                // Cập nhật ID cho từ vựng
                vocabulary.id = queryResult.insertId;
                results.push(vocabulary);
            }
            
            // Commit nếu không có lỗi
            await database.query('COMMIT');
            return results;
        } catch (error) {
            // Rollback nếu có lỗi
            await database.query('ROLLBACK');
            console.error('Error adding multiple vocabularies:', error);
            throw error;
        }
    }
}