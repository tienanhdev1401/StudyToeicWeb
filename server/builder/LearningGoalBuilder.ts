import { LearningGoal } from "../models/LearningGoal";

export class LearningGoalBuilder {
    private id: number | undefined;
    private duration: number | undefined;
    private scoreTarget: number | undefined;
    private createdAt: Date | undefined;
    private learnerId: number | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setDuration(duration: number) {
        this.duration = duration;
        return this;
    }

    public setScoreTarget(scoreTarget: number) {
        this.scoreTarget = scoreTarget;
        return this;
    }

    public setCreatedAt(createdAt: Date) {
        this.createdAt = createdAt;
        return this;
    }

    public setLearnerId(learnerId: number) {
        this.learnerId = learnerId;
        return this;
    }

    public build(): LearningGoal {
        if (this.id === undefined || this.duration === undefined || this.scoreTarget === undefined || this.createdAt === undefined || this.learnerId === undefined) {
            // Các trường trên là bắt buộc theo constructor
             throw new Error("Required fields missing for LearningGoal");
        }

        return new LearningGoal(
            this.id,
            this.duration,
            this.scoreTarget,
            this.createdAt,
            this.learnerId
        );
    }
} 