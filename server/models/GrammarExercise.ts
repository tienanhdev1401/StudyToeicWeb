import { Question } from "./Question";

export class GrammarExercise {
     id: number;
     exerciseName: string;
     questions: Question[];

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