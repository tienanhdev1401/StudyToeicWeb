import database from '../config/db';
import { Roadmap } from '../models/Roadmap';

export class RoadmapRepository {
  // Lấy roadmap theo ID
  static async getRoadmapById(id: number): Promise<Roadmap | null> {
    try {
      const results = await database.query(
        'SELECT id, tittle, content, createdAt, updatedAt, LearnerId as learnerId FROM roadmaps WHERE id = ? LIMIT 1',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new Roadmap(
        row.id, 
        row.tittle, 
        row.content, 
        row.createdAt, 
        row.updatedAt, 
        row.learnerId
      );
    } catch (error) {
      console.error(`Error getting roadmap with ID ${id}:`, error);
      throw error;
    }
  }

  // Lấy roadmap theo LearnerId
  static async getRoadmapByLearnerId(learnerId: number): Promise<Roadmap | null> {
    try {
      const results = await database.query(
        'SELECT id, tittle, content, createdAt, updatedAt, LearnerId as learnerId FROM roadmaps WHERE LearnerId = ? LIMIT 1',
        [learnerId]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new Roadmap(
        row.id, 
        row.tittle, 
        row.content, 
        row.createdAt, 
        row.updatedAt, 
        row.learnerId
      );
    } catch (error) {
      console.error(`Error getting roadmap for learner ${learnerId}:`, error);
      throw error;
    }
  }

  // Tạo mới roadmap
  static async createRoadmap(roadmap: Roadmap): Promise<Roadmap> {
    try {
      const result = await database.query(
        'INSERT INTO roadmaps (tittle, content, createdAt, LearnerId) VALUES (?, ?, ?, ?)',
        [roadmap.tittle, roadmap.content, roadmap.createdAt, roadmap.learnerId]
      );
      
      return new Roadmap(
        result.insertId,
        roadmap.tittle,
        roadmap.content,
        roadmap.createdAt,
        roadmap.updatedAt,
        roadmap.learnerId
      );
    } catch (error) {
      console.error('Error creating roadmap:', error);
      throw error;
    }
  }

  // Cập nhật roadmap
  static async updateRoadmap(roadmap: Roadmap): Promise<boolean> {
    try {
      const now = new Date();
      const result = await database.query(
        'UPDATE roadmaps SET tittle = ?, content = ?, updatedAt = ? WHERE id = ? AND LearnerId = ?',
        [
          roadmap.tittle,
          roadmap.content,
          now,
          roadmap.id,
          roadmap.learnerId
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating roadmap with ID ${roadmap?.id}:`, error);
      throw error;
    }
  }

  // Xóa roadmap
  static async deleteRoadmap(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'DELETE FROM roadmaps WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting roadmap with ID ${id}:`, error);
      throw error;
    }
  }
} 