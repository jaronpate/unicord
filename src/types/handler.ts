import { ApplicationCommandOptionType, type ApplicationCommandOption } from "./applicationCommand";
import { Trait, type EventPayload } from "./common";
import type { Context } from "./context";

export const OptionTypeMap = {
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

// Recursive type to map ApplicationCommandOption to arguments
type ArgsFromOptions<T extends readonly ApplicationCommandOption[]> = {
    [Option in T[number] as Option['name']]: Option extends { options: readonly ApplicationCommandOption[] }
        ? ArgsFromOptions<Option['options']> // Recursive inference for subcommands
        : Option['choices'] extends readonly { value: infer U }[]
        ? Option['required'] extends true // If required, keep as is; otherwise, make optional
            ? U
            : U | undefined
        : Option['type'] extends keyof typeof OptionTypeMap
        ? Option['required'] extends true // If required, keep as is; otherwise, make optional
            ? typeof OptionTypeMap[Option['type']]
            : typeof OptionTypeMap[Option['type']] | undefined
        : Option['required'] extends true
        ? unknown
        : unknown | undefined;
};

export type CommandHandlerInput<T extends readonly ApplicationCommandOption[]> = {
    args: T;
    description: string;
    [Trait.execute]: (context: Context, args: ArgsFromOptions<T>) => Promise<void> | void;
};

export class CommandHandler<T extends readonly ApplicationCommandOption[]> {
    args: T;
    description: string;
    [Trait.execute]!: (context: Context, args: ArgsFromOptions<T>) => Promise<void> | void;

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
        this[Trait.execute] = input[Trait.execute];
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

export type HandlerFunction = CommandHandlerFunction | EventHandlerFunction;
export type Handler = HandlerFunction | CommandHandler<readonly ApplicationCommandOption[]>;
