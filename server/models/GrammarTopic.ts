export class GrammarTopic {
    public id: number;
    public title: string;
    public content: string;
  
    constructor(
      id: number,
      title: string,
      content: string
    ) {
      this.id = id;
      this.title = title;
      this.content = content;
    }
}