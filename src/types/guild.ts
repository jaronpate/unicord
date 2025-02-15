import { GatewayObject } from "./base";
import { Channel } from "./channel";
import { Trait } from "./common";
import { Emoji } from "./emoji";
import { Member } from "./member";
import { Role } from "./role";

export class Guild extends GatewayObject {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    banner: string | null;
    owner_id: string;
    // emojis: Emoji[];
    // roles: Role[];

    constructor(data: Guild) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.icon = data.icon;
        this.banner = data.banner;
        this.owner_id = data.owner_id;
        // this.emojis = data.emojis;
        // this.roles = data.roles;
    }

    public static [Trait.fromDiscord]<T = Guild>(data: DiscordGuild): T {
        return new Guild({
            id: data.id,
            name: data.name,
            description: data.description,
            icon: data.icon,
            banner: data.banner,
            owner_id: data.owner_id,
            // emojis: data.emojis,
            // roles: data.roles,
        }) as T;
    }
}

export class DiscordGuild {
    system_channel_id: string | null;
    premium_progress_bar_enabled: boolean;
    region: string;
    application_id: string | null;
    premium_tier: number;
    presences: any[];
    discovery_splash: string | null;
    latest_onboarding_question_id: string | null;
    unavailable: boolean;
    afk_channel_id: string | null;
    large: boolean;
    nsfw: boolean;
    max_video_channel_users: number;
    stickers: any[];
    id: string;
    premium_subscription_count: number;
    stage_instances: any[];
    preferred_locale: string;
    guild_scheduled_events: any[];
    member_count: number;
    name: string;
    default_message_notifications: number;
    system_channel_flags: number;
    hub_type: string | null;
    lazy: boolean;
    soundboard_sounds: any[];
    threads: any[];
    banner: string | null;
    description: string | null;
    clan: string | null;
    incidents_data: string | null;
    application_command_counts: any;
    embedded_activities: any[];
    icon: string | null;
    home_header: string | null;
    joined_at: string;
    safety_alerts_channel_id: string | null;
    verification_level: number;
    max_stage_video_channel_users: number;
    emojis: Emoji[];
    owner_id: string;
    public_updates_channel_id: string | null;
    features: string[];
    rules_channel_id: string | null;
    roles: Role[];
    afk_timeout: number;
    inventory_settings: any;
    activity_instances: any[];
    max_members: number;
    channels: Channel[];
    voice_states: any[];
    splash: string | null;
    mfa_level: number;
    members: Member[];
    version: number;
    vanity_url_code: string | null;
    nsfw_level: number;
    explicit_content_filter: number;

    constructor(data: any) {
        this.system_channel_id = data.system_channel_id;
        this.premium_progress_bar_enabled = data.premium_progress_bar_enabled;
        this.region = data.region;
        this.application_id = data.application_id;
        this.premium_tier = data.premium_tier;
        this.presences = data.presences;
        this.discovery_splash = data.discovery_splash;
        this.latest_onboarding_question_id = data.latest_onboarding_question_id;
        this.unavailable = data.unavailable;
        this.afk_channel_id = data.afk_channel_id;
        this.large = data.large;
        this.nsfw = data.nsfw;
        this.max_video_channel_users = data.max_video_channel_users;
        this.stickers = data.stickers;
        this.id = data.id;
        this.premium_subscription_count = data.premium_subscription_count;
        this.stage_instances = data.stage_instances;
        this.preferred_locale = data.preferred_locale;
        this.guild_scheduled_events = data.guild_scheduled_events;
        this.member_count = data.member_count;
        this.name = data.name;
        this.default_message_notifications = data.default_message_notifications;
        this.system_channel_flags = data.system_channel_flags;
        this.hub_type = data.hub_type;
        this.lazy = data.lazy;
        this.soundboard_sounds = data.soundboard_sounds;
        this.threads = data.threads;
        this.banner = data.banner;
        this.description = data.description;
        this.clan = data.clan;
        this.incidents_data = data.incidents_data;
        this.application_command_counts = data.application_command_counts;
        this.embedded_activities = data.embedded_activities;
        this.icon = data.icon;
        this.home_header = data.home_header;
        this.joined_at = data.joined_at;
        this.safety_alerts_channel_id = data.safety_alerts_channel_id;
        this.verification_level = data.verification_level;
        this.max_stage_video_channel_users = data.max_stage_video_channel_users;
        this.emojis = data.emojis.map((emoji: any) => Emoji.fromAPIResponse(emoji));
        this.owner_id = data.owner_id;
        this.public_updates_channel_id = data.public_updates_channel_id;
        this.features = data.features;
        this.rules_channel_id = data.rules_channel_id;
        this.roles = data.roles.map((role: any) => Role.fromAPIResponse(role));
        this.afk_timeout = data.afk_timeout;
        this.inventory_settings = data.inventory_settings;
        this.activity_instances = data.activity_instances;
        this.max_members = data.max_members;
        this.channels = data.channels.map((channel: any) => Channel.fromAPIResponse(channel));
        this.voice_states = data.voice_states;
        this.splash = data.splash;
        this.mfa_level = data.mfa_level;
        this.members = data.members.map((member: any) => Member.fromAPIResponse(member));
        this.version = data.version;
        this.vanity_url_code = data.vanity_url_code;
        this.nsfw_level = data.nsfw_level;
        this.explicit_content_filter = data.explicit_content_filter;
    }

    static fromAPIResponse(data: any): DiscordGuild {
        return new DiscordGuild(data);
    }
}