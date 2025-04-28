export class Resource {
    public id: number;
    public explainResource: string | null;
    public urlAudio: string | null;
    public urlImage: string | null;
    public imageReview: string | null;
    public audioReview: string | null;

    constructor(
        id: number,
        explainResource: string | null,
        urlAudio: string | null,
        urlImage: string | null,
        imageReview: string | null = null,
        audioReview: string | null = null
    ) {
        this.id = id;
        this.explainResource = explainResource;
        this.urlAudio = urlAudio;
        this.urlImage = urlImage;
        this.imageReview = imageReview;
        this.audioReview = audioReview;
    }
}