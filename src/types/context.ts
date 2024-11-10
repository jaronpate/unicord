import type { API } from "../services/api";
import type { Client } from "../services/client";
import { isNil } from "../utils";
import { Message } from "./message";
/**
 * Represents the context of a message in a Discord channel.
 * Provides methods to interact with the message and the channel it was sent in.
 * 
 * @class Context
 * 
 * @property {string} message_id - The ID of the message that this context is associated with.
 * @property {string} channel_id - The ID of the channel where the message was sent.
 * @property {string} [guild_id] - The ID of the guild where the message was sent, if applicable.
 * 
 * @constructor
 * @param {Client} client - The client instance that is interacting with the Discord API.
 * @param {API} api - The API instance used to make requests to the Discord API.
 * @param {Message} message - The message object that this context is based on.
 * 
 * @throws {Error} If the message ID is not provided.
 * @throws {Error} If the channel ID is not provided.
 */
export class Context {
    // Public properties
    message_id: string;
    channel_id: string;
    guild_id?: string;

    constructor(private client: Client, private api: API, private _message: Message) {
        if (isNil(_message.id)) {
            throw new Error('Message ID is required to create a context');
        }

        if (isNil(_message.channel_id)) {
            throw new Error('Channel ID is required to create a context');
        }

        this.client = client;
        this.message_id = _message.id;
        this.channel_id = _message.channel_id;
        this.guild_id = _message.guild_id;
    }

    // get author() {
    //     return this.client.users.get(this.author_id);
    // };

    get message(): Message & { getReference: () => Promise<Message | null> } {
        return Object.assign(this._message, {
            getReference: async () => {
                const reference = this._message.message_reference;
                if (isNil(reference)) {
                    return null;
                }

                return Message.fromAPIResponse(await this.api.get(`/channels/${reference.channel_id}/messages/${reference.message_id}`));
            }
        });
    }

    fetchGuild() {
        if (isNil(this.guild_id)) {
            return Promise.resolve(null);
        }

        return this.client.guilds.get(this.guild_id);
    }

    /**
     * Reply to the message that this command
     * @param message The message to send to the channel
     * @param reference If true the message will be a reference the the message that triggered the command
     * @returns The message that was sent
     */
    public reply = (message: Message | string, reference: boolean = true) => {
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
        
        return this.client.sendMessage(this.channel_id, message);
    };

    /**
     * @name sendMessage
     * @description Sends a message to the channel that this context is associated with.
     * @param {Message | string} message - The message to send to the channel.
     * @returns {Promise<Message>} The message that was sent.
     */
    public sendMessage = (message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }
        return this.client.sendMessage(this.channel_id, message);
    }

    /**
     * 
     * @name delete
     * @description Deletes a message in the channel that this context is associated with.
     * @param {string} [message_id] - The ID of the message to delete. If not provided, the message ID of this context will be used.
     * @returns {Promise<void>} A promise that resolves when the message is deleted.
     */
    public delete = (message_id?: string) => {
        return this.api.delete(`/channels/${this.channel_id}/messages/${message_id ?? this.message_id}`);
    };

    /**
     * 
     * @name edit
     * @description Edits a message in the channel that this context is associated with.
     * @param {Message | string} message - The updated message content.
     * @returns {Promise<Message>} The updated message.
     */
    public edit = async (message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }
        return Message.fromAPIResponse(await this.api.patch(`/channels/${this.channel_id}/messages/${this.message_id}`, message));
    };
}