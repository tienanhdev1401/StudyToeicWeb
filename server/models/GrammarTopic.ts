import { Exercise } from "./Exercise";

export class GrammarTopic {
   id: number;
   title: string;
   content: string;
   imageUrl: string | null;
   exercises: Exercise[]; 

  constructor(
    id: number,
    title: string,
    content: string,
    imageUrl: string | null,
    exercises: Exercise[] = [] // <-- khởi tạo mặc định là mảng rỗng
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.imageUrl = imageUrl;
    this.exercises = exercises;
  }
}
