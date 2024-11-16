import type { ApplicationCommandOption, ApplicationCommandOptionType } from "./applicationCommand";
import { Trait, type EventPayload } from "./common";
import type { Context } from "./context";

type PrimitiveTypeMap = {
    [ApplicationCommandOptionType.String]: string;
    [ApplicationCommandOptionType.Integer]: number;
    [ApplicationCommandOptionType.Boolean]: boolean;
    [ApplicationCommandOptionType.Number]: number;
    [ApplicationCommandOptionType.User]: string; // Could be a user ID or object depending on your use case
    [ApplicationCommandOptionType.Channel]: string; // Could be a channel ID or object
    [ApplicationCommandOptionType.Role]: string; // Could be a role ID or object
    [ApplicationCommandOptionType.Mentionable]: string; // Could be a mentionable ID or object
    [ApplicationCommandOptionType.Attachment]: string; // Could represent attachment IDs
    [ApplicationCommandOptionType.SubCommand]: never; // Handled by `options`
    [ApplicationCommandOptionType.SubCommandGroup]: never; // Handled by `options`
};

// Recursive type to map ApplicationCommandOption to arguments
type ArgsFromOptions<T extends readonly ApplicationCommandOption[]> = {
    [Option in T[number] as Option['id']]: Option extends { options: readonly ApplicationCommandOption[] }
        ? ArgsFromOptions<Option['options']> // Recursive inference for subcommands
        : Option['choices'] extends readonly { value: infer U }[]
        ? U // Infer from choices if defined
        : Option['type'] extends keyof PrimitiveTypeMap
        ? PrimitiveTypeMap[Option['type']] // Otherwise, map from ApplicationCommandOptionType
        : unknown;
};

export type CommandHandler<T extends readonly ApplicationCommandOption[]> = {
    args: T;
    [Trait.execute]: (context: Context, args: ArgsFromOptions<T>) => Promise<void> | void;
};

// Helper function to infer type of `args`
export function createCommandHandler<T extends readonly ApplicationCommandOption[]>(
    handler: CommandHandler<T>
): CommandHandler<T> {
    return handler as CommandHandler<T>;
}

export type CommandHandlerFunction = (context: Context, args: any[]) => Promise<void> | void;
export type EventHandlerFunction = (context: Context | null, payload: EventPayload) => Promise<void> | void;

export type HandlerFunction = CommandHandlerFunction | EventHandlerFunction;
export type Handler = HandlerFunction | CommandHandler<readonly ApplicationCommandOption[]>;
