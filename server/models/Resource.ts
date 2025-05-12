export class Resource {
     id: number;
 explain_resource: string | null;
     urlAudio: string | null;
     urlImage: string | null;

    constructor(
        id: number,
        explain_resource: string | null,
        urlAudio: string | null,
        urlImage: string | null,
    ) {
        this.id = id;
        this.explain_resource = explain_resource;
        this.urlAudio = urlAudio;
        this.urlImage = urlImage;
    }
}