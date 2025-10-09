import { Comment } from "../models/Comment";

export class CommentBuilder {
    private id: number | undefined;
    private content: string | undefined;
    private createdAt: Date | undefined;
    private updatedAt: Date | undefined;
    private userId: number | undefined;
    private VocabularyTopicId: number | null | undefined;
    private GrammarTopicId: number | null | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setContent(content: string) {
        this.content = content;
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

    public setUserId(userId: number) {
        this.userId = userId;
        return this;
    }

    public setVocabularyTopicId(vocabularyTopicId: number | null) {
        this.VocabularyTopicId = vocabularyTopicId;
        return this;
    }

    public setGrammarTopicId(grammarTopicId: number | null) {
        this.GrammarTopicId = grammarTopicId;
        return this;
    }

    public build(): Comment {
        if (this.id === undefined || this.content === undefined || this.createdAt === undefined || this.updatedAt === undefined || this.userId === undefined) {
            // Tùy chọn: xử lý các trường bắt buộc bị thiếu
            // Hiện tại, chúng ta giả định các trường này sẽ được thiết lập trước khi gọi build()
        }

        return new Comment(
            this.id as number,
            this.content as string,
            this.createdAt as Date,
            this.updatedAt as Date,
            this.userId as number,
            this.VocabularyTopicId === undefined ? null : this.VocabularyTopicId,
            this.GrammarTopicId === undefined ? null : this.GrammarTopicId
        );
    }
} 