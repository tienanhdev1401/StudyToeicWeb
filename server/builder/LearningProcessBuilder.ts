import { LearningProcess } from "../models/LearningProcess";

export class LearningProcessBuilder {
    private id: number | undefined;
    private LearnerId: number | null | undefined;
    private GrammarTopicId: number | null | undefined;
    private TestId: number | null | undefined;
    private VocabularyTopicId: number | null | undefined;
    private progressStatus: string | null | undefined;
    private createdAt: Date | undefined;
    private updatedAt: Date | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setLearnerId(LearnerId: number | null) {
        this.LearnerId = LearnerId;
        return this;
    }

    public setGrammarTopicId(GrammarTopicId: number | null) {
        this.GrammarTopicId = GrammarTopicId;
        return this;
    }

    public setTestId(TestId: number | null) {
        this.TestId = TestId;
        return this;
    }

    public setVocabularyTopicId(VocabularyTopicId: number | null) {
        this.VocabularyTopicId = VocabularyTopicId;
        return this;
    }

    public setProgressStatus(progressStatus: string | null) {
        this.progressStatus = progressStatus;
        return this;
    }

    public setCreatedAt(createdAt: Date) {
        this.createdAt = createdAt;
        return this;
    }

    public setUpdatedAt(updatedAt: Date) {
        this.updatedAt = updatedAt;
        return this;
    }

    public build(): LearningProcess {
        if (this.id === undefined) {
            // ID là bắt buộc theo constructor
            throw new Error("LearningProcess ID is required");
        }

        return new LearningProcess(
            this.id,
            this.LearnerId === undefined ? null : this.LearnerId,
            this.GrammarTopicId === undefined ? null : this.GrammarTopicId,
            this.TestId === undefined ? null : this.TestId,
            this.VocabularyTopicId === undefined ? null : this.VocabularyTopicId,
            this.progressStatus === undefined ? null : this.progressStatus,
            this.createdAt,
            this.updatedAt
        );
    }
} 