
import { TestCollection } from '../models/TestCollection';
import db from '../config/db';

export class TestCollectionRepository {
    async findById(id: number): Promise<TestCollection | null> {
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

    async findAll(): Promise<TestCollection[]> {
        try {
            const rows = await db.query('SELECT * FROM `test-collection`');
            
            const testCollections = Array.isArray(rows) ? rows : [rows];
            if (!testCollections.length) return [];

            const collections = testCollections.map(row => new TestCollection(
                Number(row.id),
                row.title,
            ));
            return collections;
            
        } catch (error) {
            console.error('TestCollectionRepository.findAll error:', error);
            throw error;
        }
    }
}