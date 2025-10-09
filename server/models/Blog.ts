export class Blog {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  author: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    title: string, 
    content: string,
    imageUrl: string | null,
    author: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.imageUrl = imageUrl;
    this.author = author;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

