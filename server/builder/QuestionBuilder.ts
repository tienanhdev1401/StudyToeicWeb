import { Question } from "../models/Question";
import { Resource } from "../models/Resource";

export class QuestionBuilder {
    private id: number | undefined;
    private content: string | undefined;
    private correctAnswer: string | undefined;
    private explainDetail: string | undefined;
    private optionA: string | undefined;
    private optionB: string | undefined;
    private optionC: string | undefined;
    private optionD: string | undefined;
    private resource: Resource | null | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setContent(content: string) {
        this.content = content;
        return this;
    }

    public setCorrectAnswer(correctAnswer: string) {
        this.correctAnswer = correctAnswer;
        return this;
    }

    public setExplainDetail(explainDetail: string) {
        this.explainDetail = explainDetail;
        return this;
    }

    public setOptionA(optionA: string) {
        this.optionA = optionA;
        return this;
    }

    public setOptionB(optionB: string) {
        this.optionB = optionB;
        return this;
    }

    public setOptionC(optionC: string) {
        this.optionC = optionC;
        return this;
    }

    public setOptionD(optionD: string) {
        this.optionD = optionD;
        return this;
    }

    public setResource(resource: Resource | null) {
        this.resource = resource;
        return this;
    }

    public build(): Question {
        if (this.id === undefined || this.content === undefined || this.correctAnswer === undefined || this.explainDetail === undefined || this.optionA === undefined || this.optionB === undefined || this.optionC === undefined || this.optionD === undefined) {
            // Các trường trên là bắt buộc theo constructor
             throw new Error("Required fields missing for Question");
        }

        return new Question(
            this.id,
            this.content,
            this.correctAnswer,
            this.explainDetail,
            this.optionA,
            this.optionB,
            this.optionC,
            this.optionD,
            this.resource === undefined ? null : this.resource
        );
    }
} 