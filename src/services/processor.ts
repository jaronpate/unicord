import type { Client } from "./client";
import type { Context } from "../types/context";
import { HandlerType, Trait, type EventPayload } from "../types/common";
import { type CommandHandler, type Handler } from "../types/handler";
import type { API } from "./api";
import type { ApplicationCommandOption } from "../types/applicationCommand";

export class Processor {
    private handlers = {
        [HandlerType.Events]: new Map<string, Handler[]>(),
        [HandlerType.ChatCommands]: new Map<string, Handler[]>(),
        [HandlerType.SlashCommands]: new Map<string, Handler[]>(),
        [HandlerType.Interactions]: new Map<string, Handler[]>()
    };

    constructor(private client: Client, private api: API) {};

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
    public async execute(type: Omit<HandlerType, HandlerType.Events>, event: string, context: Context, args: any[]): Promise<void>
    public async execute(type: HandlerType, event: string, context: Context | null, argsOrPayload: any[] | EventPayload) {
        const handlers = this.handlers[type].get(event);

        if (handlers) {
            for (const handler of handlers) {
                if (isCommandHandler(handler)) {
                    if (type === HandlerType.Events) {
                        throw new Error('Event handlers cannot be a CommandHandler');
                    }

                    await Promise.resolve(handler[Trait.execute](context!, argsOrPayload));
                } else {
                    // TODO: Fix ts error
                    await Promise.resolve(handler(context, argsOrPayload));
                }
            }
        }
    }

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

    [HandlerType.SlashCommands] = {
        register: (event: string | string[], handler: Handler) => this.register(HandlerType.SlashCommands, event, handler),
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.SlashCommands, event, handler),
        execute: async (event: string, context: Context, args: any[]) => this.execute(HandlerType.SlashCommands, event, context, args),
        has: (event: string) => this.handlers[HandlerType.SlashCommands].has(event) ?? this.handlers[HandlerType.SlashCommands].get(event)?.length! > 0
    };

    [HandlerType.Interactions] = {
        register: (event: string | string[], handler: Handler) => this.register(HandlerType.Interactions, event, handler),
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.Interactions, event, handler),
        execute: async (event: string, context: Context, args: any[]) => this.execute(HandlerType.Interactions, event, context, args),
        has: (event: string) => this.handlers[HandlerType.Interactions].has(event) ?? this.handlers[HandlerType.Interactions].get(event)?.length! > 0
    };
}

const isCommandHandler = (handler: Handler): handler is CommandHandler<readonly ApplicationCommandOption[]> => {
    if (typeof handler === 'object') {
        return 'args' in handler && Trait.execute in handler;
    } else {
        return false;
    }
}