import type { Client } from "./client";
import type { Context } from "../types/context";
import { HandlerType, Trait, type EventPayload } from "../types/common";
import { CommandHandler, type Handler, type ArgsFromOptions, OptionConstructorMap, type InteractionData } from "../types/handler";
import type { API } from "./api";
import { ApplicationCommandOptionType, ApplicationCommandType, type ApplicationCommandOption } from "../types/applicationCommand";
import type { Emitter } from "./bus";

export class Processor {
    private handlers = {
        [HandlerType.Events]: new Map<string, Handler[]>(),
        [HandlerType.ChatCommands]: new Map<string, Handler[]>(),
        [HandlerType.ApplicationCommands]: new Map<string, Handler[]>(),
        [HandlerType.Interactions]: new Map<string, Handler[]>()
    };

    constructor(private client: Client, private api: API, private bus: Emitter) {};

    public register(type: HandlerType, event: string | string[], handler: Handler) {
        // Normalize events into an array
        const events = Array.isArray(event) ? event : [event];
        // Register the handler for each event
        for (const e of events) {            
            const handlers = this.handlers[type].get(e) || [];
            handlers.push(handler);
            this.handlers[type].set(e, handlers);
        }
    };

    public unregister(type: HandlerType, event: string | string[], handler?: Handler) {
        // Normalize events into an array
        const events = Array.isArray(event) ? event : [event];
        // Unregister the handler for each event
        for (const e of events) {
            if (handler) {
                // Get the handlers for the event
                const handlers = this.handlers[type].get(e);
                if (handlers) {
                    // Find the index of the handler
                    const index = handlers.indexOf(handler);
                    if (index !== -1) {
                        // Remove the handler from the array
                        handlers.splice(index, 1);
                    }
                }
            } else {
                // If no handler is provided, clear all handlers for the event
                this.handlers[type].clear();
            }
        }
    };

    public async execute(type: HandlerType.Events, event: string, context: Context | null, payload: EventPayload): Promise<void>
    public async execute(type: HandlerType.Interactions, event: string, context: Context | null, payload: InteractionData): Promise<void>
    public async execute(type: Omit<HandlerType, HandlerType.Events | HandlerType.Interactions>, event: string, context: Context, args: any[]): Promise<void>
    public async execute(type: HandlerType, event: string, context: Context | null, argsOrPayload: any[] | EventPayload) {
        const handlers = this.handlers[type].get(event);

        if (handlers) {
            for (const handler of handlers) {
                if (Processor.isCommandHandler(handler)) {
                    // TODO: Enforce this?
                    if (type === HandlerType.Events) {
                        throw new Error('Event handlers cannot be a CommandHandler');
                    }
                    // Validate and resolve the args
                    const resolvedArgs = await this.validateAndResolveArgs(argsOrPayload, handler.args);
                    // Execute the handler
                    await Promise.resolve(handler[Trait.execute](context!, resolvedArgs));
                } else {
                    // TODO: Fix ts error
                    // @ts-ignore - Haven't figured out how to type narrow this yet
                    await Promise.resolve(handler(context, argsOrPayload));
                }
            }
        }
    }
    
    private validateAndResolveArgs = async <T extends readonly ApplicationCommandOption[]>(args: any[], definition: T): Promise<ArgsFromOptions<T>> => {
        // Zip the args and definition together
        const zipped: [ApplicationCommandOption, any][] = args.map((arg, i) => [definition[i], arg]);
        // Validate the args
        const validated: Record<string, any> = {};
        // TODO: Attempt some type coresion/resolution here (mostly for text commands)
        for (const [def, arg] of zipped) {
            if (def.choices) {
                // If the definition has choices, validate the arg against them
                const choice = def.choices.find((choice: any) => choice.value === arg);
                if (!choice) {
                    throw new Error(`Invalid choice for ${def.name}: expected one of ${def.choices.map((c: any) => c.value).join(', ')}, got ${arg}`);
                }
                validated[def.name] = choice.value;
            } else if (def.type === ApplicationCommandOptionType.User) {
                // If the definition is a user, resolve the user
                // Check if the arg is a string
                if (typeof arg === 'string') {
                    // Parse out the user ID as a mention or raw ID
                    const userId = arg.match(/<@!?(\d+)>/)?.[1] ?? arg.match(/\d+/)?.[0];
                    if (!userId) {
                        throw new Error(`Invalid user for ${def.name}: expected a user mention or snowflake id, got ${arg}`);
                    }
                    validated[def.name] = await this.client.users.get(userId);
                } else if (typeof arg === 'object') {
                    // Check if the object has an ID
                    if (arg.id) {
                        validated[def.name] = await this.client.users.get(arg.id);
                    } else {
                        throw new Error(`Invalid user for ${def.name}: expected a user object with an ID, got ${arg}`);
                    }
                } else {
                    throw new Error(`Invalid user for ${def.name}: expected a user mention, snowflake id, or object, got ${arg}`);
                }
            } else {
                // Otherwise just check the type
                if (arg.value instanceof OptionConstructorMap[def.type]) {
                    // TODO: Coerce the type if possible
                    throw new Error(`Invalid type for ${def.name}: expected ${def.type}, got ${typeof arg}`);
                } else {
                    validated[def.name] = arg;
                }
            }
        }
        // TODO: Fix types so we don't need to cast here
        return Promise.resolve(validated as ArgsFromOptions<T>);
    };

    [HandlerType.Events] = {
        register: (event: string | string[], handler: Handler) => this.register(HandlerType.Events, event, handler),
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.Events, event, handler),
        execute: async (event: string, context: Context | null, payload: EventPayload) => this.execute(HandlerType.Events, event, context, payload),
        has: (event: string) => this.handlers[HandlerType.Events].has(event) && this.handlers[HandlerType.Events].get(event)?.length! > 0
    };

    [HandlerType.ChatCommands] = {
        register: (event: string | string[], handler: Handler) => this.register(HandlerType.ChatCommands, event, handler),
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.ChatCommands, event, handler),
        execute: async (event: string, context: Context, args: any[]) => this.execute(HandlerType.ChatCommands, event, context, args),
        has: (event: string) => this.handlers[HandlerType.ChatCommands].has(event) ?? this.handlers[HandlerType.ChatCommands].get(event)?.length! > 0
    };

    [HandlerType.ApplicationCommands] = {
        register: (name: string | string[], type: ApplicationCommandType, handler: Handler) => {
            const names = Array.isArray(name) ? name : [name];

            // This is an application command so we need to register it with the API
            // Ensure the handler is a CommandHandler
            // TODO: Don't enforce this?
            if (!Processor.isCommandHandler(handler)) {
                throw new Error('Handler must be a CommandHandler');
            }

            // Ensure the command name is valid
            // @see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming
            // TODO: can this sus bind be removed? Is the only way to kill the arrow function?
            const commandNameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;
            const commandNameTest = commandNameRegex.test.bind(commandNameRegex)
            if (!names.every(commandNameTest)) {
                throw new Error('Invalid application command name');
            };

            for (const n of names) {
                // Register the command with the API
                const command: Record<string, any> = handler.toJSON();
                command.name = n;
                command.type = type;
                this.api.post(`/applications/${this.client.application_id}/commands`, command);
            }

            this.register(HandlerType.ApplicationCommands, names, handler)
        },
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.ApplicationCommands, event, handler),
        execute: async (event: string, context: Context, args: any[]) => this.execute(HandlerType.ApplicationCommands, event, context, args),
        has: (event: string) => this.handlers[HandlerType.ApplicationCommands].has(event) ?? this.handlers[HandlerType.ApplicationCommands].get(event)?.length! > 0,
    };

    [HandlerType.Interactions] = {
        register: (event: string | string[], handler: Handler) => this.register(HandlerType.Interactions, event, handler),
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.Interactions, event, handler),
        execute: async (event: string, context: Context, args: InteractionData) => this.execute(HandlerType.Interactions, event, context, args),
        has: (event: string) => this.handlers[HandlerType.Interactions].has(event) ?? this.handlers[HandlerType.Interactions].get(event)?.length! > 0
    };

    static isCommandHandler = (handler: Handler): handler is CommandHandler<ApplicationCommandOption[]> => {
        if (typeof handler === 'object') {
            return 'args' in handler && Trait.execute in handler && handler instanceof CommandHandler;
        } else {
            return false;
        }
    }
}