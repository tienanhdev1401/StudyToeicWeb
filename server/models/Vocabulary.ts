export class Vocabulary {
    constructor(
      public id: number,
      public content: string,
      public meaning: string,
      public synonym: any, // Sử dụng any vì kiểu json có thể là object hoặc array
      public transcribe: string,
      public urlAudio: string,
      public urlImage: string,
      public VocabularyTopicId: number | null
    ) {}
  }