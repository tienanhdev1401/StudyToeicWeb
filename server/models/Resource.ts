export class Resource {
    public id: number;
    public paragraph: string | null;
    public urlAudio: string | null;
    public urlImage: string | null;

    constructor(
        id: number,
        paragraph: string | null,
        urlAudio: string | null,
        urlImage: string | null,
    ) {
        this.id = id;
        this.paragraph = paragraph;
        this.urlAudio = urlAudio;
        this.urlImage = urlImage;
    }
}