import { Client, Message } from '..';

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

export class InteractionContext {
    public client: Client;
    public interaction: Record<string, any>;
    constructor({ client, interaction }: { client: Client; interaction: Record<string, any> }) {
        this.client = client;
        this.interaction = interaction;
    }

    ack = (type: InteractionResponseType = InteractionResponseType.Pong, data?: Record<string, any>) => {
        return this.client.api.post(`/interactions/${this.interaction.id}/${this.interaction.token}/callback`, {
            type,
            data
        });
    };

    reply = (message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }
        return this.ack(InteractionResponseType.Reply, {
            ...message
        });
    };

    edit = (message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }
        return this.ack(InteractionResponseType.UpdateMessage, {
            ...message
        });
    };

    editOriginal = (message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }
        return this.client.api.patch(
            `/webhooks/${this.client.application_id}/${this.interaction.token}/messages/@original`,
            {
                type: InteractionResponseType.DeferredUpdateMessage,
                ...message
            }
        );
    };

    deleteOriginal = () => {
        return this.client.api.delete(
            `/webhooks/${this.client.application_id}/${this.interaction.token}/messages/@original`
        );
    };

    loading = async () => {
        await this.ack(InteractionResponseType.DeferredReply);
        return new InteractionContext({ client: this.client, interaction: this.interaction });
    };
}
