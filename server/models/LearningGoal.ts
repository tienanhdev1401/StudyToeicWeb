export class LearningGoal {
     id: number;
     duration: number;
     scoreTarget: number;
     createdAt: Date;
     learnerId: number;
  
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