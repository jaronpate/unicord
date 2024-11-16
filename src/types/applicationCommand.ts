import { Trait } from "./common";

// Enum for Application Command Types
export enum ApplicationCommandType {
    ChatInput = 1,
    User = 2,
    Message = 3,
    PrimaryEntryPoint = 4,
}

// Enum for Application Command Option Types
export enum ApplicationCommandOptionType {
    SubCommand = 1,
    SubCommandGroup = 2,
    String = 3,
    Integer = 4,
    Boolean = 5,
    User = 6,
    Channel = 7,
    Role = 8,
    Mentionable = 9,
    Number = 10,
    Attachment = 11,
}

// Enum for Channel Types (if applicable for options)
export enum ChannelType {
    GuildText = 0,
    DM = 1,
    GuildVoice = 2,
    GroupDm = 3,
    GuildCategory = 4,
    GuildNews = 5,
    GuildStore = 6,
    GuildNewsThread = 10,
    GuildPublicThread = 11,
    GuildPrivateThread = 12,
    GuildStageVoice = 13,
    GuildDirectory = 14,
    GuildForum = 15,
}

// Enum for Application Command Handler Types
export enum ApplicationCommandHandlerType {
    AppHandler = 1,
    LaunchActivity = 2,
}

// Define the ApplicationCommandOption type
export type ApplicationCommandOption = {
    type: ApplicationCommandOptionType;
    name: string;
    id: string;
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