export class Submission {
  public id?: number;
  public tittle?: string;
  public totalscore?: number;
  public listeningScore?: number;
  public readingScore?: number;
  public completionTime?: number;
  public userAnswer?: any; // JSON
  public createdAt?: Date;
  public updatedAt?: Date;
  public LearnerId?: number;
  public TestId?: number;

  constructor(submissionData: {
    id?: number;
    tittle?: string;
    totalscore?: number;
    listeningScore?: number;
    readingScore?: number;
    completionTime?: number;
    userAnswer?: any;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    LearnerId?: number;
    TestId?: number;
  }) {
    this.id = submissionData.id;
    this.tittle = submissionData.tittle;
    this.totalscore = submissionData.totalscore;
    this.listeningScore = submissionData.listeningScore;
    this.readingScore = submissionData.readingScore;
    this.completionTime = submissionData.completionTime;
    this.userAnswer = submissionData.userAnswer;
    
    this.createdAt = submissionData.createdAt instanceof Date 
      ? submissionData.createdAt 
      : submissionData.createdAt ? new Date(submissionData.createdAt) : undefined;
    
    this.updatedAt = submissionData.updatedAt instanceof Date 
      ? submissionData.updatedAt 
      : submissionData.updatedAt ? new Date(submissionData.updatedAt) : undefined;
    
    this.LearnerId = submissionData.LearnerId;
    this.TestId = submissionData.TestId;
  }

  public toJSON() {
    return {
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
      TestId: this.TestId
    };
  }
} 