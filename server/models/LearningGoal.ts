export class LearningGoal {
    public id: number;
    public duration: number;
    public scoreTarget: number;
    public createdAt: Date;
    public learnerId: number;
  
    constructor(
      id: number,
      duration: number,
      scoreTarget: number,
      createdAt: Date,
      learnerId: number
    ) {
      this.id = id;
      this.duration = duration;
      this.scoreTarget = scoreTarget;
      this.createdAt = createdAt;
      this.learnerId = learnerId;
    }
  }