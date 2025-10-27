import { UnicordGatewayObject } from './base';
import { Trait } from './common';
import { User, type DiscordUser } from './user';

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
    GUILD_MEDIA = 16,
}

export enum ChannelFlags {
    PINNED = 1 << 1,
    REQUIRE_TAG = 1 << 4,
    HIDE_MEDIA_DOWNLOAD_OPTIONS = 1 << 15,
}

export enum VideoQualityMode {
    AUTO = 1,
    FULL = 2,
}

export enum SortOrderType {
    LATEST_ACTIVITY = 0,
    CREATION_DATE = 1,
}

export enum ForumLayoutType {
    NOT_SET = 0,
    LIST_VIEW = 1,
    GALLERY_VIEW = 2,
}

export type PermissionOverwrite = {
    id: string;
    type: 0 | 1; // 0 for role, 1 for member
    allow: string;
    deny: string;
};

export type ThreadMetadata = {
    archived: boolean;
    auto_archive_duration: number;
    archive_timestamp: string;
    locked: boolean;
    invitable?: boolean;
    create_timestamp?: string | null;
};

export type ThreadMember = {
    id?: string;
    user_id?: string;
    join_timestamp: string;
    flags: number;
};

export type ForumTag = {
    id: string;
    name: string;
    moderated: boolean;
    emoji_id?: string | null;
    emoji_name?: string | null;
};

export type DefaultReaction = {
    emoji_id?: string | null; // the id of a guild's custom emoji
    emoji_name?: string | null; // the unicode character of the emoji
};

export class Channel extends UnicordGatewayObject<Channel, DiscordChannel> {
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

    constructor(data: DiscordChannel) {
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
        this.recipients = data.recipients?.map((u) => User.fromDiscord(u));
        this.icon = data.icon;
        this.owner_id = data.owner_id;
        this.application_id = data.application_id;
        this.managed = data.managed;
        this.parent_id = data.parent_id;
        this.last_pin_timestamp = data.last_pin_timestamp ? new Date(data.last_pin_timestamp) : null;
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
            recipients: data.recipients,
            icon: data.icon,
            owner_id: data.owner_id,
            application_id: data.application_id,
            managed: data.managed,
            parent_id: data.parent_id,
            last_pin_timestamp: data.last_pin_timestamp,
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
            default_forum_layout: data.default_forum_layout,
        }) as T;
    }
}

// === Channel Structure ===

// | Field                               | Type                                                                        | Description                                                                                                                                                                                                                                                                                      |
// |-------------------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
// | id                                  | snowflake                                                                   | the id of this channel                                                                                                                                                                                                                                                                           |
// | type                                | integer                                                                     | the [type of channel](/docs/resources/channel#channel-object-channel-types)                                                                                                                                                                                                                      |
// | guild_id?                           | snowflake                                                                   | the id of the guild (may be missing for some channel objects received over gateway guild dispatches)                                                                                                                                                                                             |
// | position?                           | integer                                                                     | sorting position of the channel (channels with the same position are sorted by id)                                                                                                                                                                                                               |
// | permission_overwrites?              | array of [overwrite](/docs/resources/channel#overwrite-object) objects      | explicit permission overwrites for members and roles                                                                                                                                                                                                                                             |
// | name?                               | ?string                                                                     | the name of the channel (1-100 characters)                                                                                                                                                                                                                                                       |
// | topic?                              | ?string                                                                     | the channel topic (0-4096 characters for `GUILD_FORUM` and `GUILD_MEDIA` channels, 0-1024 characters for all others)                                                                                                                                                                             |
// | nsfw?                               | boolean                                                                     | whether the channel is nsfw                                                                                                                                                                                                                                                                      |
// | last_message_id?                    | ?snowflake                                                                  | the id of the last message sent in this channel (or thread for `GUILD_FORUM` or `GUILD_MEDIA` channels) (may not point to an existing or valid message or thread)                                                                                                                                |
// | bitrate?                            | integer                                                                     | the bitrate (in bits) of the voice channel                                                                                                                                                                                                                                                       |
// | user_limit?                         | integer                                                                     | the user limit of the voice channel                                                                                                                                                                                                                                                              |
// | rate_limit_per_user?\*              | integer                                                                     | amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected                                                                                                                  |
// | recipients?                         | array of [user](/docs/resources/user#user-object) objects                   | the recipients of the DM                                                                                                                                                                                                                                                                         |
// | icon?                               | ?string                                                                     | icon hash of the group DM                                                                                                                                                                                                                                                                        |
// | owner_id?                           | snowflake                                                                   | id of the creator of the group DM or thread                                                                                                                                                                                                                                                      |
// | application_id?                     | snowflake                                                                   | application id of the group DM creator if it is bot-created                                                                                                                                                                                                                                      |
// | managed?                            | boolean                                                                     | for group DM channels: whether the channel is managed by an application via the `gdm.join` OAuth2 scope                                                                                                                                                                                          |
// | parent_id?                          | ?snowflake                                                                  | for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created                                                                                                                    |
// | last_pin_timestamp?                 | ?ISO8601 timestamp                                                          | when the last pinned message was pinned. This may be `null` in events such as `GUILD_CREATE` when a message is not pinned.                                                                                                                                                                       |
// | rtc_region?                         | ?string                                                                     | [voice region](/docs/resources/voice#voice-region-object) id for the voice channel, automatic when set to null                                                                                                                                                                                   |
// | video_quality_mode?                 | integer                                                                     | the camera [video quality mode](/docs/resources/channel#channel-object-video-quality-modes) of the voice channel, 1 when not present                                                                                                                                                             |
// | message_count?\*\*                  | integer                                                                     | number of messages (not including the initial message or deleted messages) in a thread.                                                                                                                                                                                                          |
// | member_count?                       | integer                                                                     | an approximate count of users in a thread, stops counting at 50                                                                                                                                                                                                                                  |
// | thread_metadata?                    | a [thread metadata](/docs/resources/channel#thread-metadata-object) object  | thread-specific fields not needed by other channels                                                                                                                                                                                                                                              |
// | member?                             | a [thread member](/docs/resources/channel#thread-member-object) object      | thread member object for the current user, if they have joined the thread, only included on certain API endpoints                                                                                                                                                                                |
// | default_auto_archive_duration?      | integer                                                                     | default duration, copied onto newly created threads, in minutes, threads will stop showing in the channel list after the specified period of inactivity, can be set to: 60, 1440, 4320, 10080                                                                                                    |
// | permissions?                        | string                                                                      | computed permissions for the invoking user in the channel, including overwrites, only included when part of the `resolved` data received on an interaction. This does not include [implicit permissions](/docs/topics/permissions#implicit-permissions), which may need to be checked separately |
// | flags?                              | integer                                                                     | [channel flags](/docs/resources/channel#channel-object-channel-flags) combined as a [bitfield](https://en.wikipedia.org/wiki/Bit_field)                                                                                                                                                          |
// | total_message_sent?                 | integer                                                                     | number of messages ever sent in a thread, it's similar to `message_count` on message creation, but will not decrement the number when a message is deleted                                                                                                                                       |
// | available_tags?                     | array of [tag](/docs/resources/channel#forum-tag-object) objects            | the set of tags that can be used in a `GUILD_FORUM` or a `GUILD_MEDIA` channel                                                                                                                                                                                                                   |
// | applied_tags?                       | array of snowflakes                                                         | the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel                                                                                                                                                                                      |
// | default_reaction_emoji?             | ?[default reaction](/docs/resources/channel#default-reaction-object) object | the emoji to show in the add reaction button on a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel                                                                                                                                                                                           |
// | default_thread_rate_limit_per_user? | integer                                                                     | the initial `rate_limit_per_user` to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update.                                                                                                                                    |
// | default_sort_order?                 | ?integer                                                                    | the [default sort order type](/docs/resources/channel#channel-object-sort-order-types) used to order posts in `GUILD_FORUM` and `GUILD_MEDIA` channels. Defaults to `null`, which indicates a preferred sort order hasn't been set by a channel admin                                            |
// | default_forum_layout?               | integer                                                                     | the [default forum layout view](/docs/resources/channel#channel-object-forum-layout-types) used to display posts in `GUILD_FORUM` channels. Defaults to `0`, which indicates a layout view has not been set by a channel admin                                                                   |

export interface DiscordChannel {
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
}
