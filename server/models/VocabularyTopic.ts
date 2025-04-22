import { Vocabulary } from '../models/Vocabulary';


export class VocabularyTopic {
    public vocabularies: Vocabulary[] = [];
  
    constructor(
      public id: number,
      public topicName: string,
      public imgUrl: string,
      public createAt: Date,
      public updateAt: Date,
      
    ) {}
  
    // Thêm DANH SÁCH từ vựng (mới)
    addVocabularyList(vocabList: Vocabulary[]): void {
      vocabList.forEach(vocab => {
        vocab.VocabularyTopicId = this.id; // Gán topicId cho từng từ
        this.vocabularies.push(vocab);
      });
    }
  
    // Thêm 1 từ vựng (giữ lại cho tiện)
    addVocabulary(vocab: Vocabulary): void {
      vocab.VocabularyTopicId = this.id;
      this.vocabularies.push(vocab);
    }
  
    // Các phương thức khác giữ nguyên...
    getAllVocabularies(): Vocabulary[] {
      return this.vocabularies;
    }
  
    removeVocabulary(vocabId: number): void {
      this.vocabularies = this.vocabularies.filter(v => v.id !== vocabId);
    }
  }