import { Part } from './Part';

export class Test {
    id: number;
    title?: string;
    duration?: number;
    testCollection?: string;
    updatedAt?: Date;
    parts?: Part[];

    constructor(
        id: number,
        title?: string,
        testCollection?: string,
        duration?: number,
        parts: Part[] = []
    ) {
        this.id = id;
        this.title = title;
        this.testCollection = testCollection;
        this.duration = duration;
        this.updatedAt = new Date();
        this.parts = parts;
    }
}