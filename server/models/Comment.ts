export class Comment {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;                 // ID của người dùng tạo comment  // ID của bài tập (nếu comment thuộc về bài tập)
    VocabularyTopicId: number | null; // ID của chủ đề từ vựng (nếu comment thuộc về chủ đề từ vựng)
    GrammarTopicId: number | null;    // ID của chủ đề ngữ pháp (nếu comment thuộc về chủ đề ngữ pháp)

    constructor(
        id: number,
        content: string,
        createdAt: Date,
        updatedAt: Date,
        userId: number,
        VocabularyTopicId: number | null = null,
        GrammarTopicId: number | null = null
    ) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.VocabularyTopicId = VocabularyTopicId;
        this.GrammarTopicId = GrammarTopicId;
    }
}
