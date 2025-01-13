import { exists } from "../utils";
import { ApplicationCommandContext, ApplicationCommandOptionType, type ApplicationCommandOption } from "./applicationCommand";
import { Trait, type EventPayload } from "./common";
import type { Context } from "./context";
import type { DiscordGuild } from "./guild";
import type { DiscordMessage } from "./message";
import type { DiscordUser, User } from "./user";

// TODO: Flesh out InteractionPayload type
export type InteractionPayload = {
    id: string;
    token: string;
    type: number;
    data?: InteractionData;
    guild?: DiscordGuild;
    guild_id: string;
    // TODO: Add channel class
    // channel?: DiscordChannel;
    channel_id: string;
    // TODO: Add member class
    member?: Record<string, any> & { user: DiscordUser };
    user?: DiscordUser
    message?: DiscordMessage;
};

// TODO: Flesh out InteractionData type
export type InteractionData = InteractionCommpoentData | InteractionCommandData;

export type InteractionCommpoentData = {
    custom_id: string;
    component_type: number;
    values?: any[];
    resolved?: {
        users?: Record<string, DiscordUser>;
        members?: Record<string, DiscordUser>;
        roles?: Record<string, any>;
        channels?: Record<string, any>;
        messages?: Record<string, any>;
        attachments?: Record<string, any>;
    };
};

export type InteractionCommandData = {
    id: string;
    name: string;
    type: number;
    resolved?: {
        users?: Record<string, DiscordUser>;
        members?: Record<string, DiscordUser>;
        roles?: Record<string, any>;
        channels?: Record<string, any>;
        messages?: Record<string, any>;
        attachments?: Record<string, any>;
    }
    options?: {
        name: string;
        type: ApplicationCommandOptionType;
        value?: any;
        options?: InteractionCommandData[];
        focused?: boolean;
    }[];
    guild_id?: string;
    target_id?: string;
}

export const OptionConstructorMap = {
    [ApplicationCommandOptionType.String]: String,
    [ApplicationCommandOptionType.Integer]: Number,
    [ApplicationCommandOptionType.Boolean]: Boolean,
    [ApplicationCommandOptionType.Number]: Number,
    [ApplicationCommandOptionType.User]: String, // Could be a user ID or object depending on your use case
    [ApplicationCommandOptionType.Channel]: String, // Could be a channel ID or object
    [ApplicationCommandOptionType.Role]: String, // Could be a role ID or object
    [ApplicationCommandOptionType.Mentionable]: String, // Could be a mentionable ID or object
    [ApplicationCommandOptionType.Attachment]: String, // Could represent attachment IDs
    [ApplicationCommandOptionType.SubCommand]: String, // Handled by `options`
    [ApplicationCommandOptionType.SubCommandGroup]: String, // Handled by `options`
};

export type OptionTypeMap = {
    [ApplicationCommandOptionType.String]: string,
    [ApplicationCommandOptionType.Integer]: number,
    [ApplicationCommandOptionType.Boolean]: boolean,
    [ApplicationCommandOptionType.Number]: number,
    [ApplicationCommandOptionType.User]: User, // Could be a user ID or object depending on your use case
    [ApplicationCommandOptionType.Channel]: string, // Could be a channel ID or object
    [ApplicationCommandOptionType.Role]: string, // Could be a role ID or object
    [ApplicationCommandOptionType.Mentionable]: string, // Could be a mentionable ID or object
    [ApplicationCommandOptionType.Attachment]: string, // Could represent attachment IDs
    [ApplicationCommandOptionType.SubCommand]: string, // Handled by `options`
    [ApplicationCommandOptionType.SubCommandGroup]: string, // Handled by `options`
};

// Recursive type to map ApplicationCommandOption to arguments
export type ArgsFromOptions<T extends readonly ApplicationCommandOption[]> = {
    [Option in T[number] as Option['name']]: Option extends { options: readonly ApplicationCommandOption[] }
        ? ArgsFromOptions<Option['options']> // Recursive inference for subcommands
        : Option['choices'] extends readonly { value: infer U }[]
        ? Option['required'] extends true // If required, keep as is; otherwise, make optional
            ? U
            : U | undefined
        : Option['type'] extends keyof OptionTypeMap
        ? Option['required'] extends true // If required, keep as is; otherwise, make optional
            ? OptionTypeMap[Option['type']]
            : OptionTypeMap[Option['type']] | undefined
        : Option['required'] extends true
        ? unknown
        : unknown | undefined;
};

export type CommandHandlerExecuteFunction<T extends ApplicationCommandOption[]> = (context: Context, args: ArgsFromOptions<T>) => Promise<any> | any;

export type CommandHandlerInput<T extends ApplicationCommandOption[]> = {
    args: T;
    description: string;
    contexts?: ApplicationCommandContext[];
    execute: CommandHandlerExecuteFunction<T>;
};

export class CommandHandler<T extends ApplicationCommandOption[]> {
    args: T;
    description: string;
    contexts?: ApplicationCommandContext[];
    [Trait.execute]!: CommandHandlerExecuteFunction<T>;

    get execute() {
        return this[Trait.execute];
    }

    set execute(fn: CommandHandlerExecuteFunction<T>) {
        this[Trait.execute] = fn;
    }

    constructor(input: CommandHandlerInput<T>) {
        // Validate option names
        // @see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming
        for (const name of input.args.map((arg) => arg.name)) {
            if (/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u.test(name) === false) {
                throw new Error(`Invalid option name: ${name}`);
            }
        }
        this.args = input.args;
        this.description = input.description
        this.contexts = input.contexts;
        this[Trait.execute] = input.execute;
    }

    toJSON() {
        return {
            options: this.args,
            description: this.description,
            contexts: this.contexts,
        };
    }
};

// Helper function to infer type of `args`
export function createCommandHandler<T extends ApplicationCommandOption[]>(
    handler: CommandHandlerInput<T>
): CommandHandler<T> {
    return new CommandHandler(handler);
}

export type CommandHandlerFunction = (context: Context, args: any[]) => Promise<any> | any;
export type EventHandlerFunction = (context: Context | null, payload: EventPayload) => Promise<any> | any;
export type InteractionHandlerFunction<P = InteractionData> = (context: Context, payload: P) => Promise<any> | any;

export type HandlerWithoutContext = EventHandlerFunction;
export type HanderWithContext = InteractionHandlerFunction | CommandHandlerFunction | CommandHandler<ApplicationCommandOption[]>;

export type Handler = InteractionHandlerFunction<InteractionCommpoentData> | InteractionHandlerFunction<InteractionCommandData> | EventHandlerFunction | CommandHandlerFunction | CommandHandler<ApplicationCommandOption[]>;