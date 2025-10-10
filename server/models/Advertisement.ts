export class Advertisement {
  id: number | null;
  title: string;
  htmlContent: string;
  imageUrl: string | null;
  targetUrl: string | null;
  createdAt: Date | null;

  constructor(
    id: number | null,
    title: string,
    htmlContent: string,
    imageUrl: string | null,
    targetUrl: string | null,
    createdAt: Date | null
  ) {
    this.id = id;
    this.title = title;
    this.htmlContent = htmlContent;
    this.imageUrl = imageUrl;
    this.targetUrl = targetUrl;
    this.createdAt = createdAt;
  }
}
