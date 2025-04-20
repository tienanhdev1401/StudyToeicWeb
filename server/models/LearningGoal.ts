export class LearningGoal {
    public id: number;
    public duration: number;
    public scoreTarget: number;
    public learnerId: number;
  
    constructor(
      id: number,
      duration: number,
      scoreTarget: number,
      learnerId: number
    ) {
      this.id = id;
      this.duration = duration;
      this.scoreTarget = scoreTarget;
      this.learnerId = learnerId;
    }
  }