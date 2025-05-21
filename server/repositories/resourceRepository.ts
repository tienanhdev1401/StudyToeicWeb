import { Resource } from '../models/Resource';
import db from '../config/db';
import { ResourceBuilder } from '../builder/ResourceBuilder';

export class ResourceRepository {
  static async findById(id: number): Promise<Resource | null> {
    try {
      const results = await db.query(
        'SELECT id, explain_resource, urlAudio, urlImage FROM resources WHERE id = ? LIMIT 1',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new ResourceBuilder()
        .setId(row.id)
        .setExplainResource(row.explain_resource)
        .setUrlAudio(row.urlAudio)
        .setUrlImage(row.urlImage)
        .build();
    } catch (error) {
      console.error(`Error finding resource with ID ${id}:`, error);
      throw error;
    }
  }

  static async createResource(explainResource: string | null, audioUrl: string | null, imageUrl: string | null): Promise<number | null> {
    try {
      const [result] = await db.query(
        'INSERT INTO resources (explain_resource, urlAudio, urlImage) VALUES (?, ?, ?)',
        [explainResource || null, audioUrl || null, imageUrl || null]
      );
      
      const insertResult = result as any;
      return insertResult.insertId;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  static async updateResource(id: number, explainResource: string | null, audioUrl: string | null, imageUrl: string | null): Promise<void> {
    try {
      await db.query(
        'UPDATE resources SET explain_resource = ?, urlAudio = ?, urlImage = ? WHERE id = ?',
        [explainResource || null, audioUrl || null, imageUrl || null, id]
      );
    } catch (error) {
      console.error(`Error updating resource with ID ${id}:`, error);
      throw error;
    }
  }
}