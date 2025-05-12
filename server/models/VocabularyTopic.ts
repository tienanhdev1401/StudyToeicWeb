import { Vocabulary } from '../models/Vocabulary';
import { Exercise } from './Exercise';


export class VocabularyTopic {
     id: number;
     topicName: string;
     imageUrl: string | null;
     vocabularies: Vocabulary[] = [];
     exercises: Exercise[]; 
     createdAt: Date;
     updatedAt: Date;
    constructor(
      id: number,
      topicName: string,
      imageUrl: string | null,
      vocabularies: Vocabulary[]=[],
      exercises: Exercise[] = [],
      createdAt: Date,
      updatedAt: Date
    ) {
      this.id = id;
      this.topicName = topicName;
      this.imageUrl = imageUrl;
      this.vocabularies=vocabularies;
      this.exercises = exercises;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    addVocabularyList(vocabularies: Vocabulary[]) {
      this.vocabularies = vocabularies;
    }
  }