import { Exercise } from "../models/Exercise";
import { Question } from "../models/Question";

export class ExerciseBuilder {
    private id: number | undefined;
    private exerciseName: string | undefined;
    private questions: Question[] | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setExerciseName(exerciseName: string) {
        this.exerciseName = exerciseName;
        return this;
    }

    public setQuestions(questions: Question[]) {
        this.questions = questions;
        return this;
    }

    public build(): Exercise {
        if (this.id === undefined || this.exerciseName === undefined) {
            // ID và exerciseName là bắt buộc theo constructor
             throw new Error("Required fields missing for Exercise");
        }

        return new Exercise(
            this.id,
            this.exerciseName,
            this.questions === undefined ? [] : this.questions
        );
    }
} 