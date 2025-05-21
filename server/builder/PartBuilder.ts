import { Part } from "../models/Part";
import { QuestionInAPart } from "../models/QuestionInAPart";

export class PartBuilder {
    private id: number | undefined;
    private partNumber: number | undefined;
    private TestId: number | undefined;
    private questions: QuestionInAPart[] | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setPartNumber(partNumber: number) {
        this.partNumber = partNumber;
        return this;
    }

    public setTestId(TestId: number) {
        this.TestId = TestId;
        return this;
    }

    public setQuestions(questions: QuestionInAPart[]) {
        this.questions = questions;
        return this;
    }

    public build(): Part {
        if (this.id === undefined) {
             // ID là bắt buộc theo constructor
             throw new Error("Part ID is required");
        }

        return new Part(
            this.id,
            this.partNumber,
            this.TestId,
            this.questions === undefined ? [] : this.questions
        );
    }
} 