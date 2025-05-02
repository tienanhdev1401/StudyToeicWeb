export class LearningProcess {
    id: number;
    LearnerId: number | null;         // ID của học viên
    GrammarTopicId: number | null;    // ID của chủ đề ngữ pháp
    TestId: number | null;            // ID của bài kiểm tra
    VocabularyTopicId: number | null;  // ID của chủ đề từ vựng
    progressStatus: string | null;     // Trạng thái tiến độ học tập
    createdAt?: Date;
    updatedAt?: Date;

    constructor(
        id: number,
        LearnerId: number | null = null,
        GrammarTopicId: number | null = null,
        TestId: number | null = null,
        VocabularyTopicId: number | null = null,
        progressStatus: string | null = null,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        this.id = id;
        this.LearnerId = LearnerId;
        this.GrammarTopicId = GrammarTopicId;
        this.TestId = TestId;
        this.VocabularyTopicId = VocabularyTopicId;
        this.progressStatus = progressStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
} 