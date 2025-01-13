export class Member {
    user: any;
    roles: string[];
    premium_since: string | null;
    pending: boolean;
    nick: string | null;
    mute: boolean;
    joined_at: string;
    flags: number;
    deaf: boolean;
    communication_disabled_until: string | null;
    banner: string | null;
    avatar: string | null;

    constructor(data: any) {
        this.user = data.user;
        this.roles = data.roles;
        this.premium_since = data.premium_since;
        this.pending = data.pending;
        this.nick = data.nick;
        this.mute = data.mute;
        this.joined_at = data.joined_at;
        this.flags = data.flags;
        this.deaf = data.deaf;
        this.communication_disabled_until = data.communication_disabled_until;
        this.banner = data.banner;
        this.avatar = data.avatar;
    }

    static fromAPIResponse(data: any): Member {
        return new Member(data);
    }
}