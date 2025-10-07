import { LessonCaption, LessonCaptionProps } from '../models/LessonCaption';

export class LessonCaptionBuilder {
  private props: Partial<LessonCaptionProps> = {};

  public setId(id: number) {
    this.props.id = id;
    return this;
  }

  public setLessonId(lessonId: number) {
    this.props.lessonId = lessonId;
    return this;
  }

  public setLanguage(language: string) {
    this.props.language = language;
    return this;
  }

  public setStartMs(startMs: number) {
    this.props.startMs = startMs;
    return this;
  }

  public setEndMs(endMs: number) {
    this.props.endMs = endMs;
    return this;
  }

  public setText(text: string) {
    this.props.text = text;
    return this;
  }

  public setOrderIndex(orderIndex: number | null) {
    this.props.orderIndex = orderIndex;
    return this;
  }

  public setCreatedAt(createdAt: Date | string | null) {
    this.props.createdAt = createdAt ?? undefined;
    return this;
  }

  public setUpdatedAt(updatedAt: Date | string | null) {
    this.props.updatedAt = updatedAt ?? undefined;
    return this;
  }

  public build(): LessonCaption {
    if (this.props.lessonId === undefined) {
      throw new Error('LessonCaptionBuilder: lessonId is required');
    }
    if (this.props.startMs === undefined || this.props.endMs === undefined) {
      throw new Error('LessonCaptionBuilder: startMs and endMs are required');
    }
    if (this.props.text === undefined) {
      throw new Error('LessonCaptionBuilder: text is required');
    }

    return new LessonCaption({
      id: this.props.id,
      lessonId: this.props.lessonId,
      language: this.props.language,
      startMs: this.props.startMs,
      endMs: this.props.endMs,
      text: this.props.text,
      orderIndex: this.props.orderIndex ?? null,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    });
  }
}
