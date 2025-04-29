export class Roadmap {
  public id: number;
  public tittle: string;
  public content: string;
  public createdAt: Date;
  public updatedAt: Date | null;
  public learnerId: number;

  constructor(
    id: number,
    tittle: string,
    content: string,
    createdAt: Date,
    updatedAt: Date | null,
    learnerId: number
  ) {
    this.id = id;
    this.tittle = tittle;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.learnerId = learnerId;
  }
} 