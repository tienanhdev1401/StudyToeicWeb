import toeicScoreTable from '../data/toeicScoreTable.json';
import ScoreStrategy from './ScoreStrategy';

class ListeningScore  extends ScoreStrategy {
    calculate(numCorrect) {
        const score = toeicScoreTable[numCorrect?.toString()];
        return score ? score.listening : 0;
    }
}

export default ListeningScore;