import { Trait } from "./common";

// Enum for Application Command Types
export enum ApplicationCommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3,
    PRIMARY_ENTRY_POINT = 4,
}

// Enum for Application Command Option Types
export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11,
}

// Enum for Channel Types (if applicable for options)
export enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_NEWS = 5,
    GUILD_STORE = 6,
    GUILD_NEWS_THREAD = 10,
    GUILD_PUBLIC_THREAD = 11,
    GUILD_PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15,
}

// Enum for Application Command Handler Types
export enum ApplicationCommandHandlerType {
    APP_HANDLER = 1,
    DISCORD_LAUNCH_ACTIVITY = 2,
}

// Define the ApplicationCommandOption type
export type ApplicationCommandOption = {
    type: ApplicationCommandOptionType;
    name: string;
    name_localizations?: Record<string, string> | null;
    description: string;
    description_localizations?: Record<string, string> | null;
    required?: boolean;
    choices?: Array<{ name: string; value: string | number }>;
    options?: ApplicationCommandOption[]; // Recursive structure for subcommands
    channel_types?: ChannelType[];
    min_value?: number;
    max_value?: number;
    min_length?: number;
    max_length?: number;
    autocomplete?: boolean;
};

// Define the DiscordApplicationCommand type
export type DiscordApplicationCommand = {
    id: string;
    type?: ApplicationCommandType;
    application_id: string;
    guild_id?: string;
    name: string;
    name_localizations?: Record<string, string> | null;
    description: string;
    description_localizations?: Record<string, string> | null;
    options?: ApplicationCommandOption[];
    default_member_permissions?: string | null;
    dm_permission?: boolean;
    default_permission?: boolean;
    nsfw?: boolean;
    integration_types?: number[];
    contexts?: number[];
    version: string;
    handler?: ApplicationCommandHandlerType;
};

// Define the ApplicationCommand class
export class ApplicationCommand {
    id: string;
    type?: ApplicationCommandType;
    application_id: string;
    guild_id?: string;
    name: string;
    name_localizations?: Record<string, string> | null;
    description: string;
    description_localizations?: Record<string, string> | null;
    options?: ApplicationCommandOption[];
    default_member_permissions?: string | null;
    dm_permission?: boolean;
    default_permission?: boolean;
    nsfw?: boolean;
    integration_types?: number[];
    contexts?: number[];
    version: string;
    handler?: ApplicationCommandHandlerType;

    constructor(command: DiscordApplicationCommand) {
        this.id = command.id;
        this.type = command.type;
        this.application_id = command.application_id;
        this.guild_id = command.guild_id;
        this.name = command.name;
        this.name_localizations = command.name_localizations;
        this.description = command.description;
        this.description_localizations = command.description_localizations;
        this.options = command.options;
        this.default_member_permissions = command.default_member_permissions;
        this.dm_permission = command.dm_permission;
        this.default_permission = command.default_permission;
        this.nsfw = command.nsfw;
        this.integration_types = command.integration_types;
        this.contexts = command.contexts;
        this.version = command.version;
        this.handler = command.handler;
    }

    static [Trait.fromDiscord](command: DiscordApplicationCommand): ApplicationCommand {
        return new ApplicationCommand(command);
    }
}