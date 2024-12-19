import { ApplicationCommandOptionType, type ApplicationCommandOption } from "./applicationCommand";
import { Trait, type EventPayload } from "./common";
import type { Context } from "./context";

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
    [ApplicationCommandOptionType.User]: string, // Could be a user ID or object depending on your use case
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

export type CommandHandlerExecuteFunction<T extends readonly ApplicationCommandOption[]> = (context: Context, args: ArgsFromOptions<T>) => Promise<void> | void;

export type CommandHandlerInput<T extends readonly ApplicationCommandOption[]> = {
    args: T;
    description: string;
    execute: CommandHandlerExecuteFunction<T>;
};

export class CommandHandler<T extends readonly ApplicationCommandOption[]> {
    args: T;
    description: string;
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
        this[Trait.execute] = input.execute;
    }

    toJSON() {
        return {
            options: this.args,
        };
    }
};

// Helper function to infer type of `args`
export function createCommandHandler<T extends readonly ApplicationCommandOption[]>(
    handler: CommandHandlerInput<T>
): CommandHandler<T> {
    return new CommandHandler(handler);
}

export type CommandHandlerFunction = (context: Context, args: any[]) => Promise<void> | void;
export type EventHandlerFunction = (context: Context | null, payload: EventPayload) => Promise<void> | void;

export type HandlerWithoutContext = EventHandlerFunction;
export type HanderWithContext = CommandHandlerFunction | CommandHandler<readonly ApplicationCommandOption[]>;

export type Handler = EventHandlerFunction | CommandHandlerFunction | CommandHandler<readonly ApplicationCommandOption[]>;
