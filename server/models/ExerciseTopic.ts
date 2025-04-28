export class ExerciseTopic {
    public id: number;
    public exerciseName: string;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(
        id: number,
        exerciseName: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.exerciseName = exerciseName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}