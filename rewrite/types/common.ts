import { UnicordCommandContext } from "../context";

export type Primitive = string | number | boolean | null;

export interface UnicordConfig {
    token?: string;
    prefix?: string;
    intents?: Intent[];
}

export interface UnicordConfigWithDefaults extends UnicordConfig {
    intents: Intent[];
}

export type Brand<T, K> = T & { __brand: K };

export type EventName = Brand<string, 'event-name'>;

export enum UnicordArgumentType {
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

// Old type
// export type ApplicationCommandOption = {
//     type: ApplicationCommandOptionType;
//     name: string;
//     id: string;
//     name_localizations?: Record<string, string> | null;
//     description: string;
//     description_localizations?: Record<string, string> | null;
//     required?: boolean;
//     choices?: Array<{ name: string; value: string | number }>;
//     options?: ApplicationCommandOption[]; // Recursive structure for subcommands
//     channel_types?: ChannelType[];
//     min_value?: number;
//     max_value?: number;
//     min_length?: number;
//     max_length?: number;
//     autocomplete?: boolean;
// };
export interface UnicordArgumentDefinition {
    name: string;
    description: string;
    type: UnicordArgumentType;
    required: boolean;
    choices?: Array<{ name: string; value: string | number }>;
}

export interface UnicordCommandOptions {
    description?: string;
    args: UnicordArgumentDefinition[];
}

export enum UnicordEventType {
    SystemEvent = 'system',
    ChatCommands = 'chat_commands',
    ApplicationCommands = 'application_commands',
    Interactions = 'interactions',
    Custom = 'custom',
}

export interface UnicordBaseContext extends Record<string, any> {
    type: UnicordEventType;
}

export interface UnicordEventContext extends UnicordBaseContext {}

export type DefinitionTypeMap = {
    [UnicordArgumentType.String]: string;
    [UnicordArgumentType.Integer]: number;
    [UnicordArgumentType.Boolean]: boolean;
    [UnicordArgumentType.Number]: number;
    // [UnicordArgumentType.User]: User, // Could be a user ID or object depending on your use case
    [UnicordArgumentType.Channel]: string; // Could be a channel ID or object
    [UnicordArgumentType.Role]: string; // Could be a role ID or object
    [UnicordArgumentType.Mentionable]: string; // Could be a mentionable ID or object
    [UnicordArgumentType.Attachment]: string; // Could represent attachment IDs
    [UnicordArgumentType.SubCommand]: string; // Handled by `options`
    [UnicordArgumentType.SubCommandGroup]: string; // Handled by `options`
};

export type ArgumentTypeFromOptions<T extends readonly UnicordArgumentDefinition[]> = {
    [Definition in T[number] as Definition['name']]: Definition['type'] extends keyof DefinitionTypeMap
        ? Definition['choices'] extends readonly { value: infer U }[]
            ? Definition['required'] extends true // If required, keep as is; otherwise, make optional
                ? U
                : U | undefined
            : Definition['required'] extends true // If required, keep as is; otherwise, make optional
                ? DefinitionTypeMap[Definition['type']]
                : DefinitionTypeMap[Definition['type']] | undefined
        : unknown;
};

export type UnicordCommandHandler<Options extends UnicordCommandOptions> = (
    context: UnicordCommandContext,
    args: ArgumentTypeFromOptions<Options['args']>,
) => any;

export type UnicordEventHandler = (context: UnicordEventContext, payload: any) => any;

export type UnicordHandler<Options extends UnicordCommandOptions> =
    | UnicordCommandHandler<Options>
    | UnicordEventHandler;

export type ClientConfig = {
    token: string;
    application_id: string;
    prefix?: string;
    intents?: Intent[];
};

export enum Expectation {
    Guild = 'guild',
    Channel = 'channel',
    User = 'user',
    Message = 'message',
}

export enum HandlerType {
    Events = 'events',
    ChatCommands = 'chat_commands',
    ApplicationCommands = 'application_commands',
    Interactions = 'interactions',
}

export type Expects<T extends Array<Expectation>, K extends Expectation, R = true> = Extract<K, T[number]> extends never
    ? undefined
    : R;

export const clone: unique symbol = Symbol('clone');
export const fromDiscord: unique symbol = Symbol('fromDiscord');
export const execute: unique symbol = Symbol('execute');

export const Trait: {
    clone: typeof clone;
    fromDiscord: typeof fromDiscord;
    execute: typeof execute;
} = {
    clone,
    fromDiscord,
    execute,
};

export type EventPayload = any;

/**
 * Represents a payload structure used in the Discord API.
 *
 * @typedef {Object} Payload
 * @property {number} op - The opcode of the payload.
 * @property {Record<string, any>} d - The data associated with the payload.
 * @property {number | null} s - The sequence number, or null if not applicable.
 * @property {string | null} t - The event name, or null if not applicable.
 */
export type Payload = {
    op: number;
    d: Record<string, any> | Primitive | null;
    s: number | null;
    t: string | null;
};

export enum InteractionResponseType {
    Pong = 1,
    Message = 4,
    DeferredMessage = 5,
}

export enum Intent {
    GUILDS = 1 << 0,
    GUILD_MEMBERS = 1 << 1,
    GUILD_BANS = 1 << 2,
    GUILD_EMOJIS_AND_STICKERS = 1 << 3,
    GUILD_INTEGRATIONS = 1 << 4,
    GUILD_WEBHOOKS = 1 << 5,
    GUILD_INVITES = 1 << 6,
    GUILD_VOICE_STATES = 1 << 7,
    GUILD_PRESENCES = 1 << 8,
    GUILD_MESSAGES = 1 << 9,
    GUILD_MESSAGE_REACTIONS = 1 << 10,
    GUILD_MESSAGE_TYPING = 1 << 11,
    DIRECT_MESSAGES = 1 << 12,
    DIRECT_MESSAGE_REACTIONS = 1 << 13,
    DIRECT_MESSAGE_TYPING = 1 << 14,
    MESSAGE_CONTENT = 1 << 15,
    DEFAULT = 513,
    ALL = 32767,
}

export const IntentGroup: { [key in Intent]?: [string[], number] } = {
    [Intent.GUILDS]: [
        [
            'GUILD_CREATE',
            'GUILD_UPDATE',
            'GUILD_DELETE',
            'GUILD_ROLE_CREATE',
            'GUILD_ROLE_UPDATE',
            'GUILD_ROLE_DELETE',
            'CHANNEL_CREATE',
            'CHANNEL_UPDATE',
            'CHANNEL_DELETE',
            'CHANNEL_PINS_UPDATE',
            'THREAD_CREATE',
            'THREAD_UPDATE',
            'THREAD_DELETE',
            'THREAD_LIST_SYNC',
            'THREAD_MEMBER_UPDATE',
            'THREAD_MEMBERS_UPDATE *',
            'STAGE_INSTANCE_CREATE',
            'STAGE_INSTANCE_UPDATE',
            'STAGE_INSTANCE_DELETE',
        ],
        0,
    ],

    [Intent.GUILD_MEMBERS]: [
        ['GUILD_MEMBER_ADD', 'GUILD_MEMBER_UPDATE', 'GUILD_MEMBER_REMOVE', 'THREAD_MEMBERS_UPDATE *'],
        1,
    ],

    [Intent.GUILD_BANS]: [['GUILD_BAN_ADD', 'GUILD_BAN_REMOVE'], 2],

    [Intent.GUILD_EMOJIS_AND_STICKERS]: [['GUILD_EMOJIS_UPDATE', 'GUILD_STICKERS_UPDATE'], 3],

    [Intent.GUILD_INTEGRATIONS]: [
        ['GUILD_INTEGRATIONS_UPDATE', 'INTEGRATION_CREATE', 'INTEGRATION_UPDATE', 'INTEGRATION_DELETE'],
        4,
    ],

    [Intent.GUILD_WEBHOOKS]: [['WEBHOOKS_UPDATE'], 5],

    [Intent.GUILD_INVITES]: [['INVITE_CREATE', 'INVITE_DELETE'], 6],

    [Intent.GUILD_VOICE_STATES]: [['VOICE_STATE_UPDATE'], 7],

    [Intent.GUILD_PRESENCES]: [['PRESENCE_UPDATE'], 8],

    [Intent.GUILD_MESSAGES]: [['MESSAGE_CREATE', 'MESSAGE_UPDATE', 'MESSAGE_DELETE', 'MESSAGE_DELETE_BULK'], 9],

    [Intent.GUILD_MESSAGE_REACTIONS]: [
        [
            'MESSAGE_REACTION_ADD',
            'MESSAGE_REACTION_REMOVE',
            'MESSAGE_REACTION_REMOVE_ALL',
            'MESSAGE_REACTION_REMOVE_EMOJI',
        ],
        10,
    ],

    [Intent.GUILD_MESSAGE_TYPING]: [['TYPING_START'], 11],

    [Intent.DIRECT_MESSAGES]: [['MESSAGE_CREATE', 'MESSAGE_UPDATE', 'MESSAGE_DELETE', 'CHANNEL_PINS_UPDATE'], 12],

    [Intent.DIRECT_MESSAGE_REACTIONS]: [
        [
            'MESSAGE_REACTION_ADD',
            'MESSAGE_REACTION_REMOVE',
            'MESSAGE_REACTION_REMOVE_ALL',
            'MESSAGE_REACTION_REMOVE_EMOJI',
        ],
        13,
    ],

    [Intent.DIRECT_MESSAGE_TYPING]: [['TYPING_START'], 14],

    [Intent.MESSAGE_CONTENT]: [['MESSAGE_CONTENT'], 15],
};

export type DiscordAPIEvent =
    | 'READY'
    | 'RESUMED'
    | 'CHANNEL_CREATE'
    | 'CHANNEL_UPDATE'
    | 'CHANNEL_DELETE'
    | 'CHANNEL_PINS_UPDATE'
    | 'THREAD_CREATE'
    | 'THREAD_UPDATE'
    | 'THREAD_DELETE'
    | 'THREAD_LIST_SYNC'
    | 'THREAD_MEMBER_UPDATE'
    | 'THREAD_MEMBERS_UPDATE *'
    | 'STAGE_INSTANCE_CREATE'
    | 'STAGE_INSTANCE_UPDATE'
    | 'STAGE_INSTANCE_DELETE'
    | 'GUILD_CREATE'
    | 'GUILD_UPDATE'
    | 'GUILD_DELETE'
    | 'GUILD_ROLE_CREATE'
    | 'GUILD_ROLE_UPDATE'
    | 'GUILD_ROLE_DELETE'
    | 'GUILD_MEMBER_ADD'
    | 'GUILD_MEMBER_UPDATE'
    | 'GUILD_MEMBER_REMOVE'
    | 'GUILD_MEMBERS_CHUNK *'
    | 'GUILD_BAN_ADD'
    | 'GUILD_BAN_REMOVE'
    | 'GUILD_EMOJIS_UPDATE'
    | 'GUILD_STICKERS_UPDATE'
    | 'GUILD_INTEGRATIONS_UPDATE'
    | 'INTEGRATION_CREATE'
    | 'INTEGRATION_UPDATE'
    | 'INTEGRATION_DELETE'
    | 'WEBHOOKS_UPDATE'
    | 'INVITE_CREATE'
    | 'INVITE_DELETE'
    | 'VOICE_STATE_UPDATE'
    | 'MESSAGE_CREATE'
    | 'MESSAGE_UPDATE'
    | 'MESSAGE_DELETE'
    | 'MESSAGE_DELETE_BULK'
    | 'MESSAGE_REACTION_ADD'
    | 'MESSAGE_REACTION_REMOVE'
    | 'MESSAGE_REACTION_REMOVE_ALL'
    | 'MESSAGE_REACTION_REMOVE_EMOJI'
    | 'TYPING_START'
    | 'PRESENCE_UPDATE'
    | 'APPLICATION_COMMAND_CREATE'
    | 'APPLICATION_COMMAND_UPDATE'
    | 'APPLICATION_COMMAND_DELETE';

export enum DiscordAPIEvents {
    READY = 'READY',
    RESUMED = 'RESUMED',
    CHANNEL_CREATE = 'CHANNEL_CREATE',
    CHANNEL_UPDATE = 'CHANNEL_UPDATE',
    CHANNEL_DELETE = 'CHANNEL_DELETE',
    CHANNEL_PINS_UPDATE = 'CHANNEL_PINS_UPDATE',
    THREAD_CREATE = 'THREAD_CREATE',
    THREAD_UPDATE = 'THREAD_UPDATE',
    THREAD_DELETE = 'THREAD_DELETE',
    THREAD_LIST_SYNC = 'THREAD_LIST_SYNC',
    THREAD_MEMBER_UPDATE = 'THREAD_MEMBER_UPDATE',
    THREAD_MEMBERS_UPDATE = 'THREAD_MEMBERS_UPDATE *',
    STAGE_INSTANCE_CREATE = 'STAGE_INSTANCE_CREATE',
    STAGE_INSTANCE_UPDATE = 'STAGE_INSTANCE_UPDATE',
    STAGE_INSTANCE_DELETE = 'STAGE_INSTANCE_DELETE',
    GUILD_CREATE = 'GUILD_CREATE',
    GUILD_UPDATE = 'GUILD_UPDATE',
    GUILD_DELETE = 'GUILD_DELETE',
    GUILD_ROLE_CREATE = 'GUILD_ROLE_CREATE',
    GUILD_ROLE_UPDATE = 'GUILD_ROLE_UPDATE',
    GUILD_ROLE_DELETE = 'GUILD_ROLE_DELETE',
    GUILD_MEMBER_ADD = 'GUILD_MEMBER_ADD',
    GUILD_MEMBER_UPDATE = 'GUILD_MEMBER_UPDATE',
    GUILD_MEMBER_REMOVE = 'GUILD_MEMBER_REMOVE',
    GUILD_MEMBERS_CHUNK = 'GUILD_MEMBERS_CHUNK *',
    GUILD_BAN_ADD = 'GUILD_BAN_ADD',
    GUILD_BAN_REMOVE = 'GUILD_BAN_REMOVE',
    GUILD_EMOJIS_UPDATE = 'GUILD_EMOJIS_UPDATE',
    GUILD_STICKERS_UPDATE = 'GUILD_STICKERS_UPDATE',
    GUILD_INTEGRATIONS_UPDATE = 'GUILD_INTEGRATIONS_UPDATE',
    INTEGRATION_CREATE = 'INTEGRATION_CREATE',
    INTEGRATION_UPDATE = 'INTEGRATION_UPDATE',
    INTEGRATION_DELETE = 'INTEGRATION_DELETE',
    WEBHOOKS_UPDATE = 'WEBHOOKS_UPDATE',
    INVITE_CREATE = 'INVITE_CREATE',
    INVITE_DELETE = 'INVITE_DELETE',
    VOICE_STATE_UPDATE = 'VOICE_STATE_UPDATE',
    MESSAGE_CREATE = 'MESSAGE_CREATE',
    MESSAGE_UPDATE = 'MESSAGE_UPDATE',
    MESSAGE_DELETE = 'MESSAGE_DELETE',
    MESSAGE_DELETE_BULK = 'MESSAGE_DELETE_BULK',
    MESSAGE_REACTION_ADD = 'MESSAGE_REACTION_ADD',
    MESSAGE_REACTION_REMOVE = 'MESSAGE_REACTION_REMOVE',
    MESSAGE_REACTION_REMOVE_ALL = 'MESSAGE_REACTION_REMOVE_ALL',
    MESSAGE_REACTION_REMOVE_EMOJI = 'MESSAGE_REACTION_REMOVE_EMOJI',
    TYPING_START = 'TYPING_START',
    PRESENCE_UPDATE = 'PRESENCE_UPDATE',
    APPLICATION_COMMAND_CREATE = 'APPLICATION_COMMAND_CREATE',
    APPLICATION_COMMAND_UPDATE = 'APPLICATION_COMMAND_UPDATE',
    APPLICATION_COMMAND_DELETE = 'APPLICATION_COMMAND_DELETE',
}
