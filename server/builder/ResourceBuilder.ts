import { Resource } from "../models/Resource";

export class ResourceBuilder {
    private id: number | undefined;
    private explain_resource: string | null | undefined;
    private urlAudio: string | null | undefined;
    private urlImage: string | null | undefined;

    public setId(id: number) {
        this.id = id;
        return this;
    }

    public setExplainResource(explain_resource: string | null) {
        this.explain_resource = explain_resource;
        return this;
    }

    public setUrlAudio(urlAudio: string | null) {
        this.urlAudio = urlAudio;
        return this;
    }

    public setUrlImage(urlImage: string | null) {
        this.urlImage = urlImage;
        return this;
    }

    public build(): Resource {
        if (this.id === undefined) {
             // ID là bắt buộc theo constructor
             throw new Error("Resource ID is required");
        }

        return new Resource(
            this.id,
            this.explain_resource === undefined ? null : this.explain_resource,
            this.urlAudio === undefined ? null : this.urlAudio,
            this.urlImage === undefined ? null : this.urlImage
        );
    }
} 