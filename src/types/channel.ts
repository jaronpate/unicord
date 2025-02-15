import { GatewayObject } from './base';
import { Trait } from './common';
import { User } from './user';

export enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_ANNOUNCEMENT = 5,
    ANNOUNCEMENT_THREAD = 10,
    PUBLIC_THREAD = 11,
    PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15,
    GUILD_MEDIA = 16
}

export enum ChannelFlags {
    PINNED = 1 << 1,
    REQUIRE_TAG = 1 << 4,
    HIDE_MEDIA_DOWNLOAD_OPTIONS = 1 << 15
}

export enum VideoQualityMode {
    AUTO = 1,
    FULL = 2
}

export enum SortOrderType {
    LATEST_ACTIVITY = 0,
    CREATION_DATE = 1
}

export enum ForumLayoutType {
    NOT_SET = 0,
    LIST_VIEW = 1,
    GALLERY_VIEW = 2
}

export type PermissionOverwrite = {
    id: string;
    type: 0 | 1; // 0 for role, 1 for member
    allow: string;
    deny: string;
}

export type ThreadMetadata = {
    archived: boolean;
    auto_archive_duration: number;
    archive_timestamp: string;
    locked: boolean;
    invitable?: boolean;
    create_timestamp?: string | null;
}

export type ThreadMember = {
    id?: string;
    user_id?: string;
    join_timestamp: string;
    flags: number;
}

export type ForumTag = {
    id: string;
    name: string;
    moderated: boolean;
    emoji_id?: string | null;
    emoji_name?: string | null;
}

export class Channel extends GatewayObject {
    id: string;
    type: ChannelType;
    guild_id?: string;
    position?: number;
    permission_overwrites?: PermissionOverwrite[];
    name?: string;
    topic?: string | null;
    nsfw?: boolean;
    last_message_id?: string | null;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    recipients?: User[];
    icon?: string | null;
    owner_id?: string;
    application_id?: string;
    parent_id?: string | null;
    last_pin_timestamp?: string | null;
    rtc_region?: string | null;
    video_quality_mode?: VideoQualityMode;
    message_count?: number;
    member_count?: number;
    thread_metadata?: ThreadMetadata;
    member?: ThreadMember;
    default_auto_archive_duration?: number;
    permissions?: string;
    flags?: number;
    total_message_sent?: number;
    available_tags?: ForumTag[];
    applied_tags?: string[];
    default_reaction_emoji?: {
        emoji_id?: string | null;
        emoji_name?: string | null;
    };
    default_thread_rate_limit_per_user?: number;
    default_sort_order?: SortOrderType | null;
    default_forum_layout?: ForumLayoutType;

    constructor(data: any) {
        super();
        this.id = data.id;
        this.type = data.type;
        this.guild_id = data.guild_id;
        this.position = data.position;
        this.permission_overwrites = data.permission_overwrites;
        this.name = data.name;
        this.topic = data.topic;
        this.nsfw = data.nsfw;
        this.last_message_id = data.last_message_id;
        this.bitrate = data.bitrate;
        this.user_limit = data.user_limit;
        this.rate_limit_per_user = data.rate_limit_per_user;
        this.recipients = data.recipients?.map((u: any) => new User(u));
        this.icon = data.icon;
        this.owner_id = data.owner_id;
        this.application_id = data.application_id;
        this.parent_id = data.parent_id;
        this.last_pin_timestamp = data.last_pin_timestamp;
        this.rtc_region = data.rtc_region;
        this.video_quality_mode = data.video_quality_mode;
        this.message_count = data.message_count;
        this.member_count = data.member_count;
        this.thread_metadata = data.thread_metadata;
        this.member = data.member;
        this.default_auto_archive_duration = data.default_auto_archive_duration;
        this.permissions = data.permissions;
        this.flags = data.flags;
        this.total_message_sent = data.total_message_sent;
        this.available_tags = data.available_tags;
        this.applied_tags = data.applied_tags;
        this.default_reaction_emoji = data.default_reaction_emoji;
        this.default_thread_rate_limit_per_user = data.default_thread_rate_limit_per_user;
        this.default_sort_order = data.default_sort_order;
        this.default_forum_layout = data.default_forum_layout;
    }

    static [Trait.fromDiscord](data: any): Channel {
        return new Channel(data);
    }
}
