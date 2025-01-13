export class Emoji {
    version: number;
    roles: string[];
    require_colons: boolean;
    name: string;
    managed: boolean;
    id: string;
    available: boolean;
    animated: boolean;

    constructor(data: any) {
        this.version = data.version;
        this.roles = data.roles;
        this.require_colons = data.require_colons;
        this.name = data.name;
        this.managed = data.managed;
        this.id = data.id;
        this.available = data.available;
        this.animated = data.animated;
    }

    static fromAPIResponse(data: any): Emoji {
        return new Emoji(data);
    }
}