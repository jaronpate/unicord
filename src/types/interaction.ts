import { Client } from '..';
import { InteractionContext } from '../lib';

export abstract class Interaction {
    abstract custom_id: string | string[];
    abstract execute: InteractionFunction;
}

export type InteractionFunction = (client: Client, context: InteractionContext, data: Record<string, any>) => void;

export enum InteractionResponseType {
    Pong = 1,
    Reply = 4,
    DeferredReply = 5,
    DeferredUpdateMessage = 6,
    UpdateMessage = 7,
    AutocompleteResult = 8,
    Modal = 9
}
