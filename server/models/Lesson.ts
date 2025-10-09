import { LessonCaption } from './LessonCaption';

export interface LessonProps {
  id: number;
  title: string;
  videoUrl: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  durationSec?: number | null;
  topic?: string | null;
  status?: string;
  level?: string | null;
  language?: string | null;
  tags?: string[] | null;
  transcriptUrl?: string | null;
  captions?: LessonCaption[];
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export class Lesson {
  id: number;
  title: string;
  videoUrl: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  durationSec?: number | null;
  topic?: string | null;
  status: string;
  level?: string | null;
  language?: string | null;
  tags?: string[] | null;
  transcriptUrl?: string | null;
  captions: LessonCaption[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: LessonProps) {
    this.id = props.id;
    this.title = props.title;
    this.videoUrl = props.videoUrl;
    this.description = props.description ?? null;
    this.thumbnailUrl = props.thumbnailUrl ?? null;
    this.durationSec = props.durationSec ?? null;
    this.topic = props.topic ?? null;
    this.status = props.status ?? 'draft';
    this.level = props.level ?? null;
    this.language = props.language ?? null;
    this.tags = props.tags ?? null;
    this.transcriptUrl = props.transcriptUrl ?? null;
    this.captions = props.captions ?? [];

    this.createdAt = props.createdAt
      ? props.createdAt instanceof Date
        ? props.createdAt
        : new Date(props.createdAt)
      : undefined;

    this.updatedAt = props.updatedAt
      ? props.updatedAt instanceof Date
        ? props.updatedAt
        : new Date(props.updatedAt)
      : undefined;
  }

  get isPublished(): boolean {
    return this.status === 'published';
  }
}
