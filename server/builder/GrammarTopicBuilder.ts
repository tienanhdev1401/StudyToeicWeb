import { GrammarTopic } from "../models/GrammarTopic";
import { Exercise } from "../models/Exercise";

export class GrammarTopicBuilder {
  private id: number | undefined;
  private title: string | undefined;
  private content: string | undefined;
  private imageUrl: string | null | undefined;
  private exercises: Exercise[] | undefined;

  public setId(id: number) {
    this.id = id;
    return this;
  }

  public setTitle(title: string) {
    this.title = title;
    return this;
  }

  public setContent(content: string) {
    this.content = content;
    return this;
  }

  public setImageUrl(imageUrl: string | null) {
    this.imageUrl = imageUrl;
    return this;
  }

  public setExercises(exercises: Exercise[]) {
    this.exercises = exercises;
    return this;
  }

  public build(): GrammarTopic {
    if (this.id === undefined || this.title === undefined || this.content === undefined) {
      
    }

    return new GrammarTopic(
      this.id as number,
      this.title as string,
      this.content as string,
      this.imageUrl === undefined ? null : this.imageUrl,
      this.exercises === undefined ? [] : this.exercises
    );
  }
} 