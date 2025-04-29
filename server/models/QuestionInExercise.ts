import { Question } from './Question';
import { Exercise } from './Exercise';

export class QuestionInExercise {
    PartId: number;
    QuestionId: number;
    constructor(
        PartId: number,
        QuestionId: number,
    ) {
        this.PartId = PartId;
        this.QuestionId = QuestionId;
    }
}