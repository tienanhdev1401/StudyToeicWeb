class ScoreContext {
    constructor(strategy) {
        this.strategy = strategy
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    calculate(numCorrect) {
        return this.strategy.calculate(numCorrect);
    }
}

export default ScoreContext;