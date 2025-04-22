import { Test } from './Test';

export class TestCollection {
    id: number;
    title?: string;

    tests?: Test[];

    constructor(
        id: number,
        title?: string,
        tests: Test[] = []
    ) {
        this.id = id;
        this.title = title;
        this.tests = tests;
    }
}