import toeicScoreTable from '../data/toeicScoreTable.json';
import ScoreStrategy from './ScoreStrategy';

class ReadingScore extends ScoreStrategy {
    calculate(numCorrect) {
        const score = toeicScoreTable[numCorrect?.toString()];
        return score ? score.reading : 0;
    }
}

export default ReadingScore;