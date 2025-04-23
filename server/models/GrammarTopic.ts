import { Exercise } from "./Exercise";

export class GrammarTopic {
  public id: number;
  public title: string;
  public content: string;
  public imageUrl: string | null;
  public exercises: Exercise[]; // <-- thêm thuộc tính này

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
