export class Roadmap {
   id: number;
   tittle: string;
   content: string;
   createdAt: Date;
   updatedAt: Date | null;
   learnerId: number;

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