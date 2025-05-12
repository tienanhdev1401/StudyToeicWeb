class WordNote {
    id: number;
    title: string;
    LearnerId: number;

    constructor(
        id: number,
        title: string,
        LearnerId: number
    ) {
        this.id = id;
        this.title = title;
        this.LearnerId = LearnerId;
    }
}

export default WordNote; 