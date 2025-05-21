import { VocabularyTopic } from "../models/VocabularyTopic";
import { Vocabulary } from "../models/Vocabulary";
import { Exercise } from "../models/Exercise";

export class VocabularyTopicBuilder {
    private id: number | undefined;
    private topicName: string | undefined;
    private imageUrl: string | null | undefined;
    private vocabularies: Vocabulary[] | undefined;
    private exercises: Exercise[] | undefined;
    private createdAt: Date | undefined;
    private updatedAt: Date | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setTopicName(topicName: string) {
        this.topicName = topicName;
        return this;
    }

    public setImageUrl(imageUrl: string | null) {
        this.imageUrl = imageUrl;
        return this;
    }

    public setVocabularies(vocabularies: Vocabulary[]) {
        this.vocabularies = vocabularies;
        return this;
    }

    public setExercises(exercises: Exercise[]) {
        this.exercises = exercises;
        return this;
    }

    public setCreatedAt(createdAt: Date) {
        this.createdAt = createdAt;
        return this;
    }

    public setUpdatedAt(updatedAt: Date) {
        this.updatedAt = updatedAt;
        return this;
    }

    public build(): VocabularyTopic {
        if (this.id === undefined || this.topicName === undefined || this.createdAt === undefined || this.updatedAt === undefined) {
            // Tùy chọn: xử lý các trường bắt buộc bị thiếu
            // Hiện tại, chúng ta giả định các trường bắt buộc sẽ được thiết lập
        }

        return new VocabularyTopic(
            this.id as number,
            this.topicName as string,
            this.imageUrl === undefined ? null : this.imageUrl,
            this.vocabularies === undefined ? [] : this.vocabularies,
            this.exercises === undefined ? [] : this.exercises,
            this.createdAt as Date,
            this.updatedAt as Date
        );
    }
} 