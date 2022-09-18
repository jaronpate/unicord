import { Client, Context } from '..';

export abstract class Handler {
    abstract events: string | string[];
    abstract execute: HandlerFunction;
}

export type HandlerFunction = (client: Client, context: Context, data: Record<string, any>) => void;
