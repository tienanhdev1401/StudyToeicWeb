export class Resource {
    public id: number;
    public explainResource: string | null;
    public urlAudio: string | null;
    public urlImage: string | null;

    constructor(
        id: number,
        explainResource: string | null,
        urlAudio: string | null,
        urlImage: string | null,
    ) {
        this.id = id;
        this.explainResource = explainResource;
        this.urlAudio = urlAudio;
        this.urlImage = urlImage;
    }
}