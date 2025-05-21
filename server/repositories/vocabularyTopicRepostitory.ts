import database from '../config/db';
import { VocabularyTopic } from '../models/VocabularyTopic';
import { Vocabulary } from '../models/Vocabulary';
import { VocabularyRepository } from './vocabularyRepository';
import { Exercise } from '../models/Exercise';
import { ExerciseRepository } from './exerciseRepository';
import { VocabularyTopicBuilder } from '../builder/VocabularyTopicBuilder';

export class VocabularyTopicRepository {
  /**
   * Tìm VocabularyTopic theo ID
   */
  static async findById(id: number): Promise<VocabularyTopic | null> {
    const results = await database.query(
      'SELECT id, topicName, imageUrl FROM vocabularytopics WHERE id = ? LIMIT 1',
      [id]
    );
  
    if (Array.isArray(results) && results.length === 0) {
      return null;
    }
  
    const topicData = results[0] as any;
    const topic = new VocabularyTopicBuilder()
      .setId(topicData.id)
      .setTopicName(topicData.topicName)
      .setImageUrl(topicData.imageUrl)
      .setCreatedAt(topicData.createdAt)
      .setUpdatedAt(topicData.updatedAt)
      .build();
  
    // Lấy danh sách vocabularies từ VocabularyRepository
    const vocabularies = await VocabularyRepository.getVocabulariesByTopicId(id);
    topic.addVocabularyList(vocabularies);
  
    return topic;
  }


  static async getAllVocabularyTopics(): Promise<VocabularyTopic[]> {
    // Lấy tất cả topics
    const topics = await database.query(
      'SELECT id, topicName, imageUrl FROM vocabularytopics'
    );

    // Tạo danh sách VocabularyTopic với vocabularyList rỗng
    const topicList = topics.map((topic: any) => 
      new VocabularyTopicBuilder()
        .setId(topic.id)
        .setTopicName(topic.topicName)
        .setImageUrl(topic.imageUrl)
        .setCreatedAt(topic.createdAt)
        .setUpdatedAt(topic.updatedAt)
        .build()
    );

    return topicList;
}

static async getExercisesForVocabularyTopic(vocabularyTopicId: number): Promise<Exercise[]> {
  try {
    // 1. First, check if the grammar topic exists
    const topicExists = await database.query(
      'SELECT id FROM vocabularytopics WHERE id = ? LIMIT 1',
      [vocabularyTopicId]
    );
    
    if (topicExists.length === 0) {
      throw new Error(`Grammar topic with ID ${vocabularyTopicId} not found`);
    }

    // 2. Get all exercise IDs associated with this grammar topic
    const exerciseLinks = await database.query(
      'SELECT exerciseId FROM `vocabularytopic-exercise` WHERE vocabularyTopicId = ?', // Thêm backticks
      [vocabularyTopicId]
    );

    if (exerciseLinks.length === 0) {
      return [];
    }

    // 3. Get full exercise details for each linked exercise
    const exercises = await Promise.all(
      exerciseLinks.map(async (link: any) => {
        const exercise = await ExerciseRepository.findById(link.exerciseId);
        return exercise;
      })
    );

    // 4. Filter out any null values and return
    return exercises.filter(ex => ex !== null) as Exercise[];
  } catch (error) {
    console.error(`Error getting exercises for grammar topic ${vocabularyTopicId}:`, error);
    throw error;
  }
}





}