import { Question } from './Question';
import { Part } from './Part';

export class QuestionInAPart {
    questionNumber?: number;
    PartId: number;
    QuestionId: number;
    question?: Question;

    constructor(
        PartId: number,
        QuestionId: number,
        questionNumber?: number,
        question?: Question
    ) {
        this.PartId = PartId;
        this.QuestionId = QuestionId;
        this.questionNumber = questionNumber;
        this.question = question;
    }
}