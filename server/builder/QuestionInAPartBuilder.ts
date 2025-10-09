import { QuestionInAPart } from "../models/QuestionInAPart";
import { Question } from "../models/Question";

export class QuestionInAPartBuilder {
    private questionNumber: number | undefined;
    private PartId: number | undefined;
    private QuestionId: number | undefined;
    private question: Question | undefined;

    public setQuestionNumber(questionNumber: number) {
        this.questionNumber = questionNumber;
        return this;
    }

    public setPartId(PartId: number) {
        this.PartId = PartId;
        return this;
    }

    public setQuestionId(QuestionId: number) {
        this.QuestionId = QuestionId;
        return this;
    }

    public setQuestion(question: Question) {
        this.question = question;
        return this;
    }

    public build(): QuestionInAPart {
        if (this.PartId === undefined || this.QuestionId === undefined) {
            // PartId và QuestionId là bắt buộc theo constructor
             throw new Error("PartId and QuestionId are required for QuestionInAPart");
        }
        return new QuestionInAPart(
            this.PartId,
            this.QuestionId,
            this.questionNumber,
            this.question
        );
    }
} 