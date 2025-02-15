import { Trait } from "./common";

export class Channel {
    version: number;
    type: number;
    position: number;
    permission_overwrites: any[];
    name: string;
    id: string;
    flags: number;
    topic?: string | null;
    rate_limit_per_user?: number;
    parent_id?: string;
    last_message_id?: string | null;
    user_limit?: number;
    rtc_region?: string | null;
    bitrate?: number;
    last_pin_timestamp?: string;

    constructor(data: any) {
        this.version = data.version;
        this.type = data.type;
        this.position = data.position;
        this.permission_overwrites = data.permission_overwrites;
        this.name = data.name;
        this.id = data.id;
        this.flags = data.flags;
        this.topic = data.topic;
        this.rate_limit_per_user = data.rate_limit_per_user;
        this.parent_id = data.parent_id;
        this.last_message_id = data.last_message_id;
        this.user_limit = data.user_limit;
        this.rtc_region = data.rtc_region;
        this.bitrate = data.bitrate;
        this.last_pin_timestamp = data.last_pin_timestamp;
    }

    static [Trait.fromDiscord](data: DiscordChannel): Channel {
        return new Channel({
            version: data.version,
            type: data.type,
            position: data.position,
            permission_overwrites: data.permission_overwrites,
            name: data.name,
            id: data.id,
            flags: data.flags,
            topic: data.topic,
            rate_limit_per_user: data.rate_limit_per_user,
            parent_id: data.parent_id,
            last_message_id: data.last_message_id,
            user_limit: data.user_limit,
            rtc_region: data.rtc_region,
            bitrate: data.bitrate,
            last_pin_timestamp: data.last_pin_timestamp
        });
    }

    static fromAPIResponse(data: any): Channel {
        return new Channel(data);
    }
}

export type DiscordChannel = {
    version: number;
    type: number;
    position: number;
    permission_overwrites: any[];
    name: string;
    id: string;
    flags: number;
    topic?: string | null;
    rate_limit_per_user?: number;
    parent_id?: string;
    last_message_id?: string | null;
    user_limit?: number;
    rtc_region?: string | null;
    bitrate?: number;
    last_pin_timestamp?: string;
}