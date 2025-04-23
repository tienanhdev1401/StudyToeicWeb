import { Vocabulary } from '../models/Vocabulary';
import { Exercise } from './Exercise';


export class VocabularyTopic {
    public id: number;
    public topicName: string;
    public imageUrl: string | null;
    public vocabularies: Vocabulary[] = [];
    public exercises: Exercise[]; 
  
    constructor(
      id: number,
      topicName: string,
      imageUrl: string | null,
      vocabularies: Vocabulary[]=[],
      exercises: Exercise[] = []     
    ) {
      this.id = id;
      this.topicName = topicName;
      this.imageUrl = imageUrl;
      this.vocabularies=vocabularies;
      this.exercises = exercises;
    }
  
    // // Thêm DANH SÁCH từ vựng (mới)
    // addVocabularyList(vocabList: Vocabulary[]): void {
    //   vocabList.forEach(vocab => {
    //     vocab.VocabularyTopicId = this.id; // Gán topicId cho từng từ
    //     this.vocabularies.push(vocab);
    //   });
    // }
  
    // // Thêm 1 từ vựng (giữ lại cho tiện)
    // addVocabulary(vocab: Vocabulary): void {
    //   vocab.VocabularyTopicId = this.id;
    //   this.vocabularies.push(vocab);
    // }
  
    // // Các phương thức khác giữ nguyên...
    // getAllVocabularies(): Vocabulary[] {
    //   return this.vocabularies;
    // }
  
    // removeVocabulary(vocabId: number): void {
    //   this.vocabularies = this.vocabularies.filter(v => v.id !== vocabId);
    // }

    addVocabularyList(vocabularies: Vocabulary[]) {
      this.vocabularies = vocabularies;
    }
  }