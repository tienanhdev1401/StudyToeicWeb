
export class Question {
    id: number;
    content: string;
    correctAnswer: string;
    explainDetail: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    ResourceId?: number;

    constructor(
        id: number,
        content: string,
        correctAnswer: string,
        explainDetail: string,
        optionA: string,
        optionB: string,
        optionC: string,
        optionD: string,
        ResourceId?: number
    ) {
        this.id = id;
        this.content = content;
        this.correctAnswer = correctAnswer;
        this.explainDetail = explainDetail;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.ResourceId = ResourceId;
    }
}