export interface LessonCaptionProps {
  id?: number;
  lessonId: number;
  language?: string;
  startMs: number;
  endMs: number;
  text: string;
  orderIndex?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export class LessonCaption {
  id?: number;
  lessonId: number;
  language?: string;
  startMs: number;
  endMs: number;
  text: string;
  orderIndex?: number | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: LessonCaptionProps) {
    this.id = props.id;
    this.lessonId = props.lessonId;
    this.language = props.language || 'vi';
    this.startMs = props.startMs;
    this.endMs = props.endMs;
    this.text = props.text;
    this.orderIndex = props.orderIndex ?? null;

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
}
