import { Question } from "./Question";

export class GrammarExercise {
    public id: number;
    public exerciseName: string;
    public questions: Question[];

    constructor(
        id: number,
        exerciseName: string,
        questions: Question[]
    ) {
        this.id = id;
        this.exerciseName = exerciseName;
        this.questions = questions;
    }
}