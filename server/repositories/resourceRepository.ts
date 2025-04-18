import { Resource } from '../models/Resource';
import db from '../config/db';

export class ResourceRepository {
  async findById(id: number): Promise<Resource | null> {
    try {
      const [rows] = await db.query(
        'SELECT * FROM resources WHERE id = ?',
        [id]
      );
      
      const resources = rows as any[];
      return resources.length
        ? new Resource(
            resources[0].id,
            resources[0].paragraph,
            resources[0].urlAudio,
            resources[0].urlImage
          )
        : null;
    } catch (error) {
      console.error('ResourceRepository.findById error:', error);
      throw error;
    }
  }
}