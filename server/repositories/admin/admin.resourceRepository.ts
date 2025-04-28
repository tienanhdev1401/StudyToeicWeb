import { Resource } from '../../models/Resource';
import db from '../../config/db';

export class ResourceRepository {
  static async findById(id: number): Promise<Resource | null> {
    try {
      const results = await db.query(
        'SELECT id, explain_resource, urlAudio, urlImage FROM resources WHERE id = ? LIMIT 1',
        [id]
      );

      if (!results || results.length === 0) {
        return null;
      }

      const row = results[0];
      return new Resource(
        row.id,
        row.explain_resource,
        row.urlAudio,
        row.urlImage
      );
    } catch (error) {
      console.error(`Error finding resource with ID ${id}:`, error);
      throw error;
    }
  }


  static async createResource(explainResource: string | null, audioUrl: string | null, imageUrl: string | null): Promise<number | null> {
    try {
      const result = await db.query(
        'INSERT INTO resources (explain_resource, urlAudio, urlImage) VALUES (?, ?, ?)',
        [explainResource || null, audioUrl || null, imageUrl || null]
      );
      
      // Check if the result has the insertId property
      if (result && (result as any).insertId) {
        return (result as any).insertId;
      }
      
      return null;
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