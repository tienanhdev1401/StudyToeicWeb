import { Part } from './Part';

export class Test {
    id: number;
    title?: string;
    duration?: number;
    updatedAt?: Date;
    parts?: Part[];

    constructor(
        id: number,
        title?: string,
        duration?: number,
        parts: Part[] = []
    ) {
        this.id = id;
        this.title = title;
        this.duration = duration;
        this.updatedAt = new Date();
        this.parts = parts;
    }
}