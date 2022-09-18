import { Client } from "..";
import { InteractionResponseType } from "../types";
import { Message } from "./message";

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
