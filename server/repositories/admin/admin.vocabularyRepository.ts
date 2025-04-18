import database from '../../config/db';
import { Vocabulary } from '../../models/Vocabulary';

export class VocabularyRepository {
    static async countVocabulariesByTopicId(topicId: Number): Promise<number> {
        const results = await database.query(
            'SELECT COUNT(*) as count FROM vocabularies WHERE VocabularyTopicId = ?',
            [topicId]
        );
        return results[0].count;
    }

    static async getVocabulariesByTopicId(topicId: number): Promise<Vocabulary[] | null> {
        const [results] = await database.query(
            'SELECT * FROM vocabularies WHERE VocabularyTopicId = ?',
            [topicId]
        );
    
        if (!Array.isArray(results) || results.length === 0) {
            return null;
        }
    
        const vocabularies = results.map((row: any) => new Vocabulary(
            row.id,
            row.content,
            row.meaning,
            row.synonym,
            row.transcribe,
            row.urlAudio,
            row.urlImage,
            row.VocabularyTopicId
        ));
    
        return vocabularies;
    }
    
}

