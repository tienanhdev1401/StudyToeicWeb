import { Question } from './Question';
import { Exercise } from './Exercise';

export class QuestionInExercise {
    PartId: number;
    QuestionId: number;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(
        PartId: number,
        QuestionId: number,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.PartId = PartId;
        this.QuestionId = QuestionId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}