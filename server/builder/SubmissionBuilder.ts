import { Submission } from "../models/Submission";

export class SubmissionBuilder {
    private id: number | undefined;
    private tittle: string | undefined;
    private totalscore: number | undefined;
    private listeningScore: number | undefined;
    private readingScore: number | undefined;
    private completionTime: number | undefined;
    private userAnswer: any | undefined;
    private createdAt: Date | undefined;
    private updatedAt: Date | undefined;
    private LearnerId: number | undefined;
    private TestId: number | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setTittle(tittle: string | undefined) {
        this.tittle = tittle;
        return this;
    }

    public setTotalscore(totalscore: number | undefined) {
        this.totalscore = totalscore;
        return this;
    }

    public setListeningScore(listeningScore: number | undefined) {
        this.listeningScore = listeningScore;
        return this;
    }

    public setReadingScore(readingScore: number | undefined) {
        this.readingScore = readingScore;
        return this;
    }

    public setCompletionTime(completionTime: number | undefined) {
        this.completionTime = completionTime;
        return this;
    }

    public setUserAnswer(userAnswer: any | undefined) {
        this.userAnswer = userAnswer;
        return this;
    }

    public setCreatedAt(createdAt: Date | string | undefined) { // Cho phép Date, string hoặc undefined
        this.createdAt = createdAt instanceof Date
            ? createdAt
            : createdAt ? new Date(createdAt) : undefined;
        return this;
    }

    public setUpdatedAt(updatedAt: Date | string | undefined) { // Cho phép Date, string hoặc undefined
        this.updatedAt = updatedAt instanceof Date
            ? updatedAt
            : updatedAt ? new Date(updatedAt) : undefined;
        return this;
    }

    public setLearnerId(LearnerId: number | undefined) {
        this.LearnerId = LearnerId;
        return this;
    }

    public setTestId(TestId: number | undefined) {
        this.TestId = TestId;
        return this;
    }

    public build(): Submission {
        // Constructor hiện tại chấp nhận undefined cho hầu hết các trường
        // Chúng ta sẽ tạo đối tượng Submission với các giá trị đã set, undefined nếu không set.
        return new Submission({
            id: this.id,
            tittle: this.tittle,
            totalscore: this.totalscore,
            listeningScore: this.listeningScore,
            readingScore: this.readingScore,
            completionTime: this.completionTime,
            userAnswer: this.userAnswer,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            LearnerId: this.LearnerId,
            TestId: this.TestId,
        });
    }
} 