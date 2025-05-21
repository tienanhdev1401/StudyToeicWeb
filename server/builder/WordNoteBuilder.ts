import WordNote from "../models/WordNote";

export class WordNoteBuilder {
    private id: number | undefined;
    private title: string | undefined;
    private LearnerId: number | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setTitle(title: string) {
        this.title = title;
        return this;
    }

    public setLearnerId(LearnerId: number) {
        this.LearnerId = LearnerId;
        return this;
    }

    public build(): WordNote {
        if (this.id === undefined || this.title === undefined || this.LearnerId === undefined) {
            // Các trường trên là bắt buộc theo constructor
             throw new Error("Required fields missing for WordNote");
        }

        return new WordNote(
            this.id,
            this.title,
            this.LearnerId
        );
    }
} 