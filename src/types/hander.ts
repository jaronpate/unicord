import type { EventPayload } from "./common";
import type { Context } from "./context";

export class BaseHandler {
    constructor() {};

    public execute(context: Context | null, args: any[]) {};
}

export type CommandHandlerFunction = (context: Context, args: any[]) => void;
export type EventHandlerFunction = (context: Context | null, payload: EventPayload) => void;

export type HandlerFunction = CommandHandlerFunction | EventHandlerFunction;
export type Handler = CommandHandlerFunction | EventHandlerFunction | BaseHandler;
