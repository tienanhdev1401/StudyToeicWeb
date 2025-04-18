
import { QuestionInAPart } from './QuestionInAPart';
export class Part {
    id: number;
    partNumber?: number;
    TestId?: number;
    questions?: QuestionInAPart[];

    constructor(
        id: number,
        partNumber?: number,
        TestId?: number,
        questions: QuestionInAPart[] = []
    ) {
        this.id = id;
        this.partNumber = partNumber;
        this.TestId = TestId;
        this.questions = questions;
    }
}