import { UnicordGatewayObject } from './base';
import { Trait } from './common';
// import { Emoji } from "./emoji";
// import { Member } from "./member";
// import { Role } from "./role";

export class Guild extends UnicordGatewayObject<Guild, DiscordGuild> {
    id: string;
    name: string;
    icon: string;
    icon_hash?: string;
    splash: string;
    discovery_splash: string;
    owner?: boolean;
    owner_id: string;
    permissions?: string;
    region?: string;
    afk_channel_id: string;
    afk_timeout: number;
    widget_enabled?: boolean;
    widget_channel_id?: string;
    verification_level: number;
    default_message_notifications: number;
    explicit_content_filter: number;
    roles: Record<string, any>[];
    emojis: Record<string, any>[];
    features: Record<string, any>[];
    mfa_level: number;
    application_id: string;
    system_channel_id: string;
    system_channel_flags: number;
    rules_channel_id: string;
    max_presences?: number;
    max_members?: number;
    vanity_url_code: string;
    description: string;
    banner: string;
    premium_tier: number;
    premium_subscription_count?: number;
    preferred_locale: string;
    public_updates_channel_id: string;
    max_video_channel_users?: number;
    max_stage_video_channel_users?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
    welcome_screen?: Record<string, any>;
    nsfw_level: number;
    stickers?: string;
    premium_progress_bar_enabled: boolean;
    safety_alerts_channel_id: string;
    incidents_data: Record<string, any>;

    constructor(data: DiscordGuild) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.icon = data.icon;
        this.icon_hash = data.icon_hash;
        this.splash = data.splash;
        this.discovery_splash = data.discovery_splash;
        this.owner = data.owner;
        this.owner_id = data.owner_id;
        this.permissions = data.permissions;
        this.region = data.region;
        this.afk_channel_id = data.afk_channel_id;
        this.afk_timeout = data.afk_timeout;
        this.widget_enabled = data.widget_enabled;
        this.widget_channel_id = data.widget_channel_id;
        this.verification_level = data.verification_level;
        this.default_message_notifications = data.default_message_notifications;
        this.explicit_content_filter = data.explicit_content_filter;
        this.roles = data.roles;
        this.emojis = data.emojis;
        this.features = data.features;
        this.mfa_level = data.mfa_level;
        this.application_id = data.application_id;
        this.system_channel_id = data.system_channel_id;
        this.system_channel_flags = data.system_channel_flags;
        this.rules_channel_id = data.rules_channel_id;
        this.max_presences = data.max_presences;
        this.max_members = data.max_members;
        this.vanity_url_code = data.vanity_url_code;
        this.description = data.description;
        this.banner = data.banner;
        this.premium_tier = data.premium_tier;
        this.premium_subscription_count = data.premium_subscription_count;
        this.preferred_locale = data.preferred_locale;
        this.public_updates_channel_id = data.public_updates_channel_id;
        this.max_video_channel_users = data.max_video_channel_users;
        this.max_stage_video_channel_users = data.max_stage_video_channel_users;
        this.approximate_member_count = data.approximate_member_count;
        this.approximate_presence_count = data.approximate_presence_count;
        this.welcome_screen = data.welcome_screen;
        this.nsfw_level = data.nsfw_level;
        this.stickers = data.stickers;
        this.premium_progress_bar_enabled = data.premium_progress_bar_enabled;
        this.safety_alerts_channel_id = data.safety_alerts_channel_id;
        this.incidents_data = data.incidents_data;
    }

    public static [Trait.fromDiscord]<T = Guild>(data: DiscordGuild): T {
        return new Guild(data) as T;
    }
}

// === Guild Structure ===

// | Field                          | Type                                                                                | Description                                                                                                                                                                                 |
// |--------------------------------|-------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
// | id                             | snowflake                                                                           | guild id                                                                                                                                                                                    |
// | name                           | string                                                                              | guild name (2-100 characters, excluding trailing and leading whitespace)                                                                                                                    |
// | icon                           | ?string                                                                             | [icon hash](/docs/reference#image-formatting)                                                                                                                                               |
// | icon_hash?                     | ?string                                                                             | [icon hash](/docs/reference#image-formatting), returned when in the template object                                                                                                         |
// | splash                         | ?string                                                                             | [splash hash](/docs/reference#image-formatting)                                                                                                                                             |
// | discovery_splash               | ?string                                                                             | [discovery splash hash](/docs/reference#image-formatting); only present for guilds with the "DISCOVERABLE" feature                                                                          |
// | owner? \*                      | boolean                                                                             | true if [the user](/docs/resources/user#get-current-user-guilds) is the owner of the guild                                                                                                  |
// | owner_id                       | snowflake                                                                           | id of owner                                                                                                                                                                                 |
// | permissions? \*                | string                                                                              | total permissions for [the user](/docs/resources/user#get-current-user-guilds) in the guild (excludes overwrites and [implicit permissions](/docs/topics/permissions#implicit-permissions)) |
// | region? \*\*                   | ?string                                                                             | [voice region](/docs/resources/voice#voice-region-object) id for the guild (deprecated)                                                                                                     |
// | afk_channel_id                 | ?snowflake                                                                          | id of afk channel                                                                                                                                                                           |
// | afk_timeout                    | integer                                                                             | afk timeout in seconds                                                                                                                                                                      |
// | widget_enabled?                | boolean                                                                             | true if the server widget is enabled                                                                                                                                                        |
// | widget_channel_id?             | ?snowflake                                                                          | the channel id that the widget will generate an invite to, or `null` if set to no invite                                                                                                    |
// | verification_level             | integer                                                                             | [verification level](/docs/resources/guild#guild-object-verification-level) required for the guild                                                                                          |
// | default_message_notifications  | integer                                                                             | default [message notifications level](/docs/resources/guild#guild-object-default-message-notification-level)                                                                                |
// | explicit_content_filter        | integer                                                                             | [explicit content filter level](/docs/resources/guild#guild-object-explicit-content-filter-level)                                                                                           |
// | roles                          | array of [role](/docs/topics/permissions#role-object) objects                       | roles in the guild                                                                                                                                                                          |
// | emojis                         | array of [emoji](/docs/resources/emoji#emoji-object) objects                        | custom guild emojis                                                                                                                                                                         |
// | features                       | array of [guild feature](/docs/resources/guild#guild-object-guild-features) strings | enabled guild features                                                                                                                                                                      |
// | mfa_level                      | integer                                                                             | required [MFA level](/docs/resources/guild#guild-object-mfa-level) for the guild                                                                                                            |
// | application_id                 | ?snowflake                                                                          | application id of the guild creator if it is bot-created                                                                                                                                    |
// | system_channel_id              | ?snowflake                                                                          | the id of the channel where guild notices such as welcome messages and boost events are posted                                                                                              |
// | system_channel_flags           | integer                                                                             | [system channel flags](/docs/resources/guild#guild-object-system-channel-flags)                                                                                                             |
// | rules_channel_id               | ?snowflake                                                                          | the id of the channel where Community guilds can display rules and/or guidelines                                                                                                            |
// | max_presences?                 | ?integer                                                                            | the maximum number of presences for the guild (`null` is always returned, apart from the largest of guilds)                                                                                 |
// | max_members?                   | integer                                                                             | the maximum number of members for the guild                                                                                                                                                 |
// | vanity_url_code                | ?string                                                                             | the vanity url code for the guild                                                                                                                                                           |
// | description                    | ?string                                                                             | the description of a guild                                                                                                                                                                  |
// | banner                         | ?string                                                                             | [banner hash](/docs/reference#image-formatting)                                                                                                                                             |
// | premium_tier                   | integer                                                                             | [premium tier](/docs/resources/guild#guild-object-premium-tier) (Server Boost level)                                                                                                        |
// | premium_subscription_count?    | integer                                                                             | the number of boosts this guild currently has                                                                                                                                               |
// | preferred_locale               | string                                                                              | the preferred [locale](/docs/reference#locales) of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US"                      |
// | public_updates_channel_id      | ?snowflake                                                                          | the id of the channel where admins and moderators of Community guilds receive notices from Discord                                                                                          |
// | max_video_channel_users?       | integer                                                                             | the maximum amount of users in a video channel                                                                                                                                              |
// | max_stage_video_channel_users? | integer                                                                             | the maximum amount of users in a stage video channel                                                                                                                                        |
// | approximate_member_count?      | integer                                                                             | approximate number of members in this guild, returned from the `GET /guilds/<id>` and `/users/@me/guilds` endpoints when `with_counts` is `true`                                            |
// | approximate_presence_count?    | integer                                                                             | approximate number of non-offline members in this guild, returned from the `GET /guilds/<id>` and `/users/@me/guilds`  endpoints when `with_counts` is `true`                               |
// | welcome_screen?                | [welcome screen](/docs/resources/guild#welcome-screen-object) object                | the welcome screen of a Community guild, shown to new members, returned in an [Invite](/docs/resources/invite#invite-object)'s guild object                                                 |
// | nsfw_level                     | integer                                                                             | [guild NSFW level](/docs/resources/guild#guild-object-guild-nsfw-level)                                                                                                                     |
// | stickers?                      | array of [sticker](/docs/resources/sticker#sticker-object) objects                  | custom guild stickers                                                                                                                                                                       |
// | premium_progress_bar_enabled   | boolean                                                                             | whether the guild has the boost progress bar enabled                                                                                                                                        |
// | safety_alerts_channel_id       | ?snowflake                                                                          | the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord                                                                                    |
// | incidents_data                 | ?[incidents data](/docs/resources/guild#incidents-data-object) object               | the incidents data for this guild                                                                                                                                                           |

export interface DiscordGuild {
    id: string;
    name: string;
    icon: string;
    icon_hash?: string;
    splash: string;
    discovery_splash: string;
    owner?: boolean;
    owner_id: string;
    permissions?: string;
    region?: string;
    afk_channel_id: string;
    afk_timeout: number;
    widget_enabled?: boolean;
    widget_channel_id?: string;
    verification_level: number;
    default_message_notifications: number;
    explicit_content_filter: number;
    roles: Record<string, any>[];
    emojis: Record<string, any>[];
    features: Record<string, any>[];
    mfa_level: number;
    application_id: string;
    system_channel_id: string;
    system_channel_flags: number;
    rules_channel_id: string;
    max_presences?: number;
    max_members?: number;
    vanity_url_code: string;
    description: string;
    banner: string;
    premium_tier: number;
    premium_subscription_count?: number;
    preferred_locale: string;
    public_updates_channel_id: string;
    max_video_channel_users?: number;
    max_stage_video_channel_users?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
    welcome_screen?: Record<string, any>;
    nsfw_level: number;
    stickers?: string;
    premium_progress_bar_enabled: boolean;
    safety_alerts_channel_id: string;
    incidents_data: Record<string, any>;
}
