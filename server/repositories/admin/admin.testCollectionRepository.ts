
import { TestCollection } from '../../models/TestCollection';
import db from '../../config/db';

export class TestCollectionRepository {
    static async findById(id: number): Promise<TestCollection | null> {
        try {
            const rows = await db.query(
                'SELECT * FROM `test-collection` WHERE id = ?',
                [id]
            );
            
            const testCollections = Array.isArray(rows) ? rows : [rows];
            if (!testCollections.length) return null;

            const testCollection = new TestCollection(
                Number(testCollections[0].id),
                testCollections[0].title,
            );
            return testCollection;

        } catch (error) {
            console.error('TestCollectionRepository.findById error:', error);
            throw error;
        }
    }

    static async findAll(): Promise<TestCollection[]> {
        try {
            const rows = await db.query('SELECT DISTINCT testCollection FROM tests');
            
            const distinctCollections = Array.isArray(rows) ? rows : [rows];
            if (!distinctCollections.length) return [];
    
            const collections = distinctCollections.map((row, index) => new TestCollection(
                index + 1, // ID tự sinh
                row.testCollection
            ));
    
            return collections;
        } catch (error) {
            console.error('TestCollectionRepository.findAll error:', error);
            throw error;
        }
    }
    
}