import type { EventPayload } from "./common";
import type { Context } from "./context";

export class BaseHandler {
    constructor() {};

    public async execute(context: Context | null, args: any[]) {};
}

export type CommandHandlerFunction = (context: Context, args: any[]) => Promise<void> | void;
export type EventHandlerFunction = (context: Context | null, payload: EventPayload) => Promise<void> | void;

export type HandlerFunction = CommandHandlerFunction | EventHandlerFunction;
export type Handler = HandlerFunction | BaseHandler;
