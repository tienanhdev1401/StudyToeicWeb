import ScoreContext from '../context/ScoreContext';
import ListeningScore from '../strategies/ListeningScore';
import ReadingScore from '../strategies/ReadingScore';

class scoreService {
    constructor() {
        this.scoreContext = new ScoreContext(null);
    }

    calculateListeningScore(numCorrect) {
        this.scoreContext.setStrategy(new ListeningScore());
        return this.scoreContext.calculate(numCorrect);
    }

    calculateReadingScore(numCorrect) {
        this.scoreContext.setStrategy(new ReadingScore());
        return this.scoreContext.calculate(numCorrect);
    }

    calculateTotalScore(listeningCorrect, readingCorrect) {
        const listeningScore = this.calculateListeningScore(listeningCorrect);
        const readingScore = this.calculateReadingScore(readingCorrect);
        return listeningScore + readingScore;
      }
}

export default scoreService;
