import { Resource } from '../models/Resource';
import db from '../config/db';

export class ResourceRepository {
  static async findById(id: number): Promise<Resource | null> {
    try {
      const results = await db.query(
        'SELECT id,explain_resource, paragraph, urlAudio, urlImage FROM resources WHERE id = ? LIMIT 1',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new Resource(
        row.id,
        row.explain_resource,
        row.paragraph,
        row.urlAudio,
        row.urlImage
      );
    } catch (error) {
      console.error(`Error finding resource with ID ${id}:`, error);
      throw error;
    }
  }
}