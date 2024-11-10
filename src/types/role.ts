export class Role {
    version: number;
    unicode_emoji: string | null;
    tags: any;
    position: number;
    permissions: string;
    name: string;
    mentionable: boolean;
    managed: boolean;
    id: string;
    icon: string | null;
    hoist: boolean;
    flags: number;
    color: number;

    constructor(data: any) {
        this.version = data.version;
        this.unicode_emoji = data.unicode_emoji;
        this.tags = data.tags;
        this.position = data.position;
        this.permissions = data.permissions;
        this.name = data.name;
        this.mentionable = data.mentionable;
        this.managed = data.managed;
        this.id = data.id;
        this.icon = data.icon;
        this.hoist = data.hoist;
        this.flags = data.flags;
        this.color = data.color;
    }

    static fromAPIResponse(data: any): Role {
        return new Role(data);
    }
}