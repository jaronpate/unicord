import type { ApplicationCommandOption, ApplicationCommandOptionType } from "./applicationCommand";
import { Trait, type EventPayload } from "./common";
import type { Context } from "./context";

type PrimitiveTypeMap = {
    [ApplicationCommandOptionType.STRING]: string;
    [ApplicationCommandOptionType.INTEGER]: number;
    [ApplicationCommandOptionType.BOOLEAN]: boolean;
    [ApplicationCommandOptionType.NUMBER]: number;
    [ApplicationCommandOptionType.USER]: string; // Could be a user ID or object depending on your use case
    [ApplicationCommandOptionType.CHANNEL]: string; // Could be a channel ID or object
    [ApplicationCommandOptionType.ROLE]: string; // Could be a role ID or object
    [ApplicationCommandOptionType.MENTIONABLE]: string; // Could be a mentionable ID or object
    [ApplicationCommandOptionType.ATTACHMENT]: string; // Could represent attachment IDs
    [ApplicationCommandOptionType.SUB_COMMAND]: never; // Handled by `options`
    [ApplicationCommandOptionType.SUB_COMMAND_GROUP]: never; // Handled by `options`
};

// Recursive type to map ApplicationCommandOption to arguments
type ArgsFromOptions<T extends readonly ApplicationCommandOption[]> = {
    [Option in T[number] as Option['name']]: Option extends { options: readonly ApplicationCommandOption[] }
        ? ArgsFromOptions<Option['options']> // Recursive inference for subcommands
        : Option['choices'] extends readonly { value: infer U }[]
        ? U // Infer from choices if defined
        : Option['type'] extends keyof PrimitiveTypeMap
        ? PrimitiveTypeMap[Option['type']] // Otherwise, map from ApplicationCommandOptionType
        : unknown;
};

export type BaseHandler<T extends readonly ApplicationCommandOption[]> = {
    args: T;
    [Trait.execute]: (context: Context, args: ArgsFromOptions<T>) => Promise<void> | void;
};

// Helper function to infer type of `args`
export function createCommandHandler<T extends readonly ApplicationCommandOption[]>(
    handler: BaseHandler<T>
): BaseHandler<T> {
    return handler as BaseHandler<T>;
}

const handler = createCommandHandler({
    args: [
        {
            type: 3,
            name: "name",
            description: "The name of the user",
            required: true
        },
        {
            type: 3,
            name: "age",
            description: "The age of the user",
            required: true,
            choices: [
                { name: "18", value: "18" },
                { name: "19", value: "19" },
                { name: "20", value: "20" }
            ]
        }
    ] as const,
    [Trait.execute]: async (context, args) => {
        console.log(args);
    }
});

export type CommandHandlerFunction = (context: Context, args: any[]) => Promise<void> | void;
export type EventHandlerFunction = (context: Context | null, payload: EventPayload) => Promise<void> | void;

export type HandlerFunction = CommandHandlerFunction | EventHandlerFunction;
export type Handler = HandlerFunction | BaseHandler<any>;
