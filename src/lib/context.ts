import { Client } from '..';
import { Message } from '../lib';

export class Context {
    private readonly client: Client;
    // Public properties
    message_id: string;
    channel_id: string;
    guild_id: string;

    constructor({ client, message }: { client: Client; message: Partial<Message> }) {
        this.client = client;
        this.message_id = message.id;
        this.channel_id = message.channel_id;
        this.guild_id = message.guild_id;
    }

    get guild() {
        return this.client.guilds.get(this.guild_id);
    }

    /**
     * Reply to the message that this command
     * @param message The message to send to the channel
     * @param reference If true the message will be a reference the the message that triggered the command
     * @returns The message that was sent
     */
    public reply = (message: Message | string, reference: boolean = false) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }
        if (reference) {
            message.message_reference = {
                message_id: this.message_id,
                channel_id: this.channel_id,
                guild_id: this.guild_id
            };
        }
        return this.client.send(this.channel_id, message);
    };

    public delete = (message_id?: string) => {
        return this.client.api.delete(`/channels/${this.channel_id}/messages/${message_id ?? this.message_id}`);
    };

    public edit = (message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }
        return this.client.api.patch(`/channels/${this.channel_id}/messages/${this.message_id}`, message);
    };
}
