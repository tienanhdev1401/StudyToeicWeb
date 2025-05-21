import database from '../config/db';
import WordNote from '../models/WordNote';
// Giả sử bạn có một model/bảng Vocabulary và một bảng liên kết
// import Vocabulary from '../models/Vocabulary';
import { WordNoteBuilder } from '../builder/WordNoteBuilder';
import { VocabularyBuilder } from '../builder/VocabularyBuilder';

export class WordNoteRepository {

  static async addWordNote(title: string, learnerId: number): Promise<any> {
    try {
      const result = await database.query(
        'INSERT INTO wordnotes (title, LearnerId) VALUES (?, ?)',
        [title, learnerId]
      );
       
      const insertId = (result as any)?.insertId;
      if (!insertId) {
          throw new Error('Failed to get insertId after creating WordNote.');
      }
      
      return this.findById(insertId);
    } catch (error) {
      console.error('Error creating WordNote:', error);
      throw error;
    }
  }

 
  static async updateWordNote(wordNote: WordNote): Promise<any> {
    try {
      const result = await database.query(
        'UPDATE wordnotes SET title = ? WHERE id = ?',
        [wordNote.title, wordNote.id] 
      );
       
      const affectedRows = (result as any)?.affectedRows;
      if (affectedRows > 0) {
        return this.findById(wordNote.id); 
      } else {
        return null; 
      }
    } catch (error) {
      console.error(`Error updating WordNote with ID ${wordNote.id}:`, error); 
      throw error;
    }
  }

  static async getWordNotesByLearnerId(learnerId: number): Promise<any[]> {
    try {
      const results = await database.query(
        'SELECT id, title, LearnerId FROM wordnotes WHERE LearnerId = ?',
        [learnerId]
      );
      
      // Lấy thông tin đầy đủ cho mỗi WordNote bao gồm vocabularies
      const wordNotesWithVocabularies = await Promise.all(
        (results as any[]).map(async (row: any) => {
          return await this.findById(row.id);
        })
      );
      
      return wordNotesWithVocabularies.filter(item => item !== null);
    } catch (error) {
      console.error(`Error getting WordNotes with vocabularies for learner ID ${learnerId}:`, error);
      throw error;
    }
  }

  static async findById(id: number): Promise<any> {
    try {
      // 1. Truy vấn thông tin WordNote
      const wordNoteResults = await database.query(
        'SELECT id, title, LearnerId FROM wordnotes WHERE id = ? LIMIT 1',
        [id]
      );

      const wordNoteRow = (wordNoteResults as any)?.[0];
      
      if (!wordNoteRow) {
        return null;
      }

      // 2. Tạo đối tượng WordNote
      const wordNote = new WordNoteBuilder()
        .setId(wordNoteRow.id)
        .setTitle(wordNoteRow.title)
        .setLearnerId(wordNoteRow.LearnerId)
        .build();

      // 3. Truy vấn danh sách từ vựng liên kết với WordNote này
      const vocabularyResults = await database.query(
        `SELECT v.* 
         FROM vocabularies v
         JOIN wordnotevocabularies wv ON v.id = wv.vocabularyId
         WHERE wv.wordNoteId = ?`,
        [id]
      );

      // 4. Trả về đối tượng kết hợp
      return {
        ...wordNote, // Trải rộng WordNote để có id, title, LearnerId
        vocabularies: (vocabularyResults as any[] || []).map((v: any) => new VocabularyBuilder()
          .setId(v.id)
          .setContent(v.content)
          .setMeaning(v.meaning)
          .setSynonym(v.synonym ? JSON.parse(v.synonym) : null)
          .setTranscribe(v.transcribe)
          .setUrlAudio(v.urlAudio)
          .setUrlImage(v.urlImage)
          .setVocabularyTopicId(v.VocabularyTopicId) // Giả định trường này có trong kết quả join nếu cần
          .build()
        )
      };
    } catch (error) {
      console.error(`Error finding WordNote with ID ${id}`, error);
      throw error;
    }
  }

  static async deleteWordNote(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'DELETE FROM wordnotes WHERE id = ?',
        [id]
      );
      const affectedRows = (result as any)?.affectedRows;
      return affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting WordNote with ID ${id}:`, error);
      throw error;
    }
  }
  static async addVocabularyToWordNote(wordNoteId: number, vocabularyId: number): Promise<boolean> {
    try {
        const result = await database.query(
            'INSERT INTO wordnotevocabularies (WordNoteId, VocabularyId) VALUES (?, ?)',
            [wordNoteId, vocabularyId]
        );
        const affectedRows = (result as any)?.affectedRows;
        return affectedRows > 0;
    } catch (error) {
        console.error(`Error adding Vocabulary ${vocabularyId} to WordNote ${wordNoteId}:`, error);
        throw error;
    }
  }
  

  static async removeVocabularyFromWordNote(wordNoteId: number, vocabularyId: number): Promise<boolean> {
    try {
        const result = await database.query(
            'DELETE FROM wordnotevocabularies WHERE WordNoteId = ? AND VocabularyId = ?',
            [wordNoteId, vocabularyId]
        );
        const affectedRows = (result as any)?.affectedRows;
        return affectedRows > 0;
    } catch (error) {
        console.error(`Error removing Vocabulary ${vocabularyId} from WordNote ${wordNoteId}:`, error);
        throw error;
    }
  }

  // Thêm các phương thức khác nếu cần, ví dụ: getVocabulariesForWordNote...
}
