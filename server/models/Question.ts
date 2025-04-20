import { Resource } from "./Resource";

export class Question {
    public id: number;
    public content: string;
    public correctAnswer: string;
    public explainDetail: string;
    public optionA: string;
    public optionB: string;
    public optionC: string;
    public optionD: string;
    public resource: Resource | null; 

    constructor(
        id: number,
        content: string,
        correctAnswer: string,
        explainDetail: string,
        optionA: string,
        optionB: string,
        optionC: string,
        optionD: string,
        resource: Resource | null = null 
    ) {
        this.id = id;
        this.content = content;
        this.correctAnswer = correctAnswer;
        this.explainDetail = explainDetail;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.resource = resource;
    }
}