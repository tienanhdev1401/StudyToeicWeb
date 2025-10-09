import { Lesson, LessonProps } from '../models/Lesson';
import { LessonCaption } from '../models/LessonCaption';

export class LessonBuilder {
  private props: Partial<LessonProps> = {};

  public setId(id: number) {
    this.props.id = id;
    return this;
  }

  public setTitle(title: string) {
    this.props.title = title;
    return this;
  }

  public setVideoUrl(videoUrl: string) {
    this.props.videoUrl = videoUrl;
    return this;
  }

  public setDescription(description: string | null) {
    this.props.description = description ?? null;
    return this;
  }

  public setThumbnailUrl(thumbnailUrl: string | null) {
    this.props.thumbnailUrl = thumbnailUrl ?? null;
    return this;
  }

  public setDurationSec(durationSec: number | null) {
    this.props.durationSec = durationSec ?? null;
    return this;
  }

  public setTopic(topic: string | null) {
    this.props.topic = topic ?? null;
    return this;
  }

  public setStatus(status: string) {
    this.props.status = status;
    return this;
  }

  public setLevel(level: string | null) {
    this.props.level = level ?? null;
    return this;
  }

  public setLanguage(language: string | null) {
    this.props.language = language ?? null;
    return this;
  }

  public setTags(tags: string[] | null) {
    this.props.tags = tags ?? null;
    return this;
  }

  public setTranscriptUrl(transcriptUrl: string | null) {
    this.props.transcriptUrl = transcriptUrl ?? null;
    return this;
  }

  public setCaptions(captions: LessonCaption[]) {
    this.props.captions = captions;
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

  public build(): Lesson {
    if (this.props.id === undefined) {
      throw new Error('LessonBuilder: id is required');
    }
    if (!this.props.title) {
      throw new Error('LessonBuilder: title is required');
    }
    if (!this.props.videoUrl) {
      throw new Error('LessonBuilder: videoUrl is required');
    }

    return new Lesson({
      id: this.props.id,
      title: this.props.title,
      videoUrl: this.props.videoUrl,
      description: this.props.description ?? null,
      thumbnailUrl: this.props.thumbnailUrl ?? null,
      durationSec: this.props.durationSec ?? null,
      topic: this.props.topic ?? null,
      status: this.props.status,
      level: this.props.level ?? null,
      language: this.props.language ?? null,
      tags: this.props.tags ?? null,
      transcriptUrl: this.props.transcriptUrl ?? null,
      captions: this.props.captions ?? [],
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    });
  }
}
