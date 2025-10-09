import { Vocabulary } from "../models/Vocabulary";

export class VocabularyBuilder {
    private id: number | undefined;
    private content: string | undefined;
    private meaning: string | undefined;
    private synonym: any | undefined;
    private transcribe: string | undefined;
    private urlAudio: string | undefined;
    private urlImage: string | undefined;
    private VocabularyTopicId: number | null | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setContent(content: string) {
        this.content = content;
        return this;
    }

    public setMeaning(meaning: string) {
        this.meaning = meaning;
        return this;
    }

    public setSynonym(synonym: any) {
        this.synonym = synonym;
        return this;
    }

    public setTranscribe(transcribe: string) {
        this.transcribe = transcribe;
        return this;
    }

    public setUrlAudio(urlAudio: string) {
        this.urlAudio = urlAudio;
        return this;
    }

    public setUrlImage(urlImage: string) {
        this.urlImage = urlImage;
        return this;
    }

    public setVocabularyTopicId(vocabularyTopicId: number | null) {
        this.VocabularyTopicId = vocabularyTopicId;
        return this;
    }

    public build(): Vocabulary {
        if (this.id === undefined || this.content === undefined || this.meaning === undefined || this.transcribe === undefined || this.urlAudio === undefined || this.urlImage === undefined) {
            // Tùy chọn: xử lý các trường bắt buộc bị thiếu
            // Dựa trên constructor hiện tại, các trường trên là bắt buộc ngoại trừ synonym và VocabularyTopicId có thể là null/any.
            // Hiện tại, chúng ta giả định các trường bắt buộc sẽ được thiết lập.
        }

        return new Vocabulary(
            this.id as number,
            this.content as string,
            this.meaning as string,
            this.synonym === undefined ? null : this.synonym, // Giả định synonym có thể null nếu không set
            this.transcribe as string,
            this.urlAudio as string,
            this.urlImage as string,
            this.VocabularyTopicId === undefined ? null : this.VocabularyTopicId // Giả định VocabularyTopicId có thể null nếu không set
        );
    }
} 