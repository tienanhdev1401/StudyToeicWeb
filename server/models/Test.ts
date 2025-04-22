import { Part } from './Part';

export class Test {
    id: number;
    title?: string;
    duration?: number;
    testCollectionID?: number;
    updatedAt?: Date;
    parts?: Part[];

    constructor(
        id: number,
        title?: string,
        testCollectionID?: number,
        duration?: number,
        parts: Part[] = []
    ) {
        this.id = id;
        this.title = title;
        this.testCollectionID = testCollectionID;
        this.duration = duration;
        this.updatedAt = new Date();
        this.parts = parts;
    }
}