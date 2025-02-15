import { GatewayObject } from "./base";
import { Trait } from "./common";
import { User, type DiscordUser } from "./user";

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

export type DefaultReaction = {
    emoji_id?: string | null;   // the id of a guild's custom emoji
    emoji_name?: string | null; // the unicode character of the emoji
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
    managed?: boolean;
    parent_id?: string | null;
    last_pin_timestamp?: Date | null;
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
    default_reaction_emoji?: DefaultReaction;
    default_thread_rate_limit_per_user?: number;
    default_sort_order?: SortOrderType | null;
    default_forum_layout?: ForumLayoutType;

    constructor(data: Partial<Channel>) {
        super();
        this.id = data.id!;
        this.type = data.type!;
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
        this.recipients = data.recipients;
        this.icon = data.icon;
        this.owner_id = data.owner_id;
        this.application_id = data.application_id;
        this.managed = data.managed;
        this.parent_id = data.parent_id;
        this.last_pin_timestamp = data.last_pin_timestamp instanceof Date 
            ? data.last_pin_timestamp 
            : data.last_pin_timestamp 
                ? new Date(data.last_pin_timestamp) 
                : null;
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

    public static [Trait.fromDiscord]<T = Channel>(data: DiscordChannel): T {
        return new Channel({
            id: data.id,
            type: data.type,
            guild_id: data.guild_id,
            position: data.position,
            permission_overwrites: data.permission_overwrites,
            name: data.name,
            topic: data.topic,
            nsfw: data.nsfw,
            last_message_id: data.last_message_id,
            bitrate: data.bitrate,
            user_limit: data.user_limit,
            rate_limit_per_user: data.rate_limit_per_user,
            recipients: data.recipients?.map(u => User.fromDiscord(u)),
            icon: data.icon,
            owner_id: data.owner_id,
            application_id: data.application_id,
            managed: data.managed,
            parent_id: data.parent_id,
            last_pin_timestamp: data.last_pin_timestamp ? new Date(data.last_pin_timestamp) : null,
            rtc_region: data.rtc_region,
            video_quality_mode: data.video_quality_mode,
            message_count: data.message_count,
            member_count: data.member_count,
            thread_metadata: data.thread_metadata,
            member: data.member,
            default_auto_archive_duration: data.default_auto_archive_duration,
            permissions: data.permissions,
            flags: data.flags,
            total_message_sent: data.total_message_sent,
            available_tags: data.available_tags,
            applied_tags: data.applied_tags,
            default_reaction_emoji: data.default_reaction_emoji,
            default_thread_rate_limit_per_user: data.default_thread_rate_limit_per_user,
            default_sort_order: data.default_sort_order,
            default_forum_layout: data.default_forum_layout
        }) as T;
    }
}

export class DiscordChannel {
    id: string;
    type: number;
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
    recipients?: DiscordUser[];
    icon?: string | null;
    owner_id?: string;
    application_id?: string;
    managed?: boolean;
    parent_id?: string | null;
    last_pin_timestamp?: string | null;
    rtc_region?: string | null;
    video_quality_mode?: number;
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
    default_reaction_emoji?: DefaultReaction;
    default_thread_rate_limit_per_user?: number;
    default_sort_order?: number | null;
    default_forum_layout?: number;

    constructor(data: any) {
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
        this.recipients = data.recipients;
        this.icon = data.icon;
        this.owner_id = data.owner_id;
        this.application_id = data.application_id;
        this.managed = data.managed;
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

    static fromAPIResponse(data: any): DiscordChannel {
        return new DiscordChannel(data);
    }
}
