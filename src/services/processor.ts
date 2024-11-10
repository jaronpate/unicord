import type { Client } from "./client";
import type { Context } from "../types/context";
import { HandlerType, type EventPayload, type Payload } from "../types/common";
import { BaseHandler, type Handler } from "../types/hander";

export class Processor {
    private handlers = {
        [HandlerType.Events]: new Map<string, Handler[]>(),
        [HandlerType.Commands]: new Map<string, Handler[]>(),
        [HandlerType.Interactions]: new Map<string, Handler[]>()
    };

    constructor(private client: Client) {};

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

    public execute(type: HandlerType.Events, event: string, context: Context | null, payload: EventPayload): void
    public execute(type: Omit<HandlerType, HandlerType.Events>, event: string, context: Context, args: any[]): void
    public execute(type: HandlerType, event: string, context: Context | null, argsOrPayload: any[] | EventPayload) {
        const handlers = this.handlers[type].get(event);

        if (handlers) {
            for (const handler of handlers) {
                if (handler instanceof BaseHandler) {
                    handler.execute(context, argsOrPayload);
                } else {
                    // TODO: Fix ts error
                    handler(context, argsOrPayload);
                }
            }
        }
    }

    [HandlerType.Events] = {
        register: (event: string | string[], handler: Handler) => this.register(HandlerType.Events, event, handler),
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.Events, event, handler),
        execute: (event: string, context: Context | null, payload: EventPayload) => this.execute(HandlerType.Events, event, context, payload),
        has: (event: string) => this.handlers[HandlerType.Events].has(event) && this.handlers[HandlerType.Events].get(event)?.length! > 0
    };

    [HandlerType.Commands] = {
        register: (event: string | string[], handler: Handler) => this.register(HandlerType.Commands, event, handler),
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.Commands, event, handler),
        execute: (event: string, context: Context, args: any[]) => this.execute(HandlerType.Commands, event, context, args),
        has: (event: string) => this.handlers[HandlerType.Commands].has(event) ?? this.handlers[HandlerType.Commands].get(event)?.length! > 0
    };

    [HandlerType.Interactions] = {
        register: (event: string | string[], handler: Handler) => this.register(HandlerType.Interactions, event, handler),
        unregister: (event: string | string[], handler?: Handler) => this.unregister(HandlerType.Interactions, event, handler),
        execute: (event: string, context: Context, args: any[]) => this.execute(HandlerType.Interactions, event, context, args),
        has: (event: string) => this.handlers[HandlerType.Interactions].has(event) ?? this.handlers[HandlerType.Interactions].get(event)?.length! > 0
    };
}
