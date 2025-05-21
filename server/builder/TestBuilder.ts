import { Test } from "../models/Test";
import { Part } from "../models/Part";

export class TestBuilder {
    private id: number | undefined;
    private title: string | undefined;
    private duration: number | undefined;
    private testCollection: string | undefined;
    private updatedAt: Date | undefined;
    private parts: Part[] | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setTitle(title: string) {
        this.title = title;
        return this;
    }

    public setDuration(duration: number) {
        this.duration = duration;
        return this;
    }

    public setTestCollection(testCollection: string) {
        this.testCollection = testCollection;
        return this;
    }

    public setUpdatedAt(updatedAt: Date) {
        this.updatedAt = updatedAt;
        return this;
    }

    public setParts(parts: Part[]) {
        this.parts = parts;
        return this;
    }

    public build(): Test {
        if (this.id === undefined) {
            // ID là bắt buộc theo constructor
            throw new Error("Test ID is required");
        }

        return new Test(
            this.id,
            this.title,
            this.testCollection,
            this.duration,
            this.parts === undefined ? [] : this.parts
        );
    }
} 