import type { API } from "../services/api";
import type { Client } from "../services/client";
import { hydrate, hydrator, type Hydrateable, type Hydrated } from "../services/hydrator";
import { isNil } from "../utils";
import { fromDiscord, type Expectation } from "./common";
import type { Guild } from "./guild";
import { type DiscordMessage, Message, type MessagePayload } from "./message";
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

export type HydratedContext<T extends Array<Expectation>> = Context & {
    guild: Extract<Expectation.Guild, T[number]> extends never ? undefined : Guild;
};

export class Context {
    // Public properties
    message_id: string;
    channel_id: string;
    guild_id?: string;

    constructor(private client: Client, private api: API, public message: MessagePayload) {
        console.log('Context created: ', );
        if (isNil(message.id)) {
            throw new Error('Message ID is required to create a context');
        }

        if (isNil(message.channel_id)) {
            throw new Error('Channel ID is required to create a context');
        }

        this.client = client;
        this.message_id = message.id;
        this.channel_id = message.channel_id;
        this.guild_id = message.guild_id;
    }

    /**
     * Hydrates a given data object based on the provided expectations.
     * 
     * @template T - The type of the data object to be hydrated. Must extend `Hydrateable`.
     * @template K - An array of `Expectation` types that specify what properties should be hydrated.
     * 
     * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
     * @param expectations - An array of expectations that specify what properties should be hydrated.
     * 
     * @returns A promise that resolves to the hydrated data object.
     * 
     * @throws Will throw an error if an expectation cannot be resolved.
     */
    hydrate = async <
        T extends Hydrateable | Hydrated<Hydrateable, Array<Expectation>>,
        K extends Array<Expectation>
    >(data: T, expectations: K) => {
        return hydrate<T, K>(data, expectations, this.client, this.api);
    }

    /**
     * A wrapper function that attempts to hydrate a given data object and returns a type guard function.
     * 
     * @template T - The type of the data object to be hydrated. Must extend `Hydrateable`.
     * @template K - An array of `Expectation` types that specify what properties should be hydrated.
     * 
     * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
     * @param expectations - An array of expectations that specify what properties should be hydrated.
     * 
     * @returns A promise that resolves to a type guard function. The type guard function returns `true` if the data object was successfully hydrated, otherwise `false`.
     */
    hydrator = async <T extends Hydrateable | Hydrated<Hydrateable, Array<Expectation>>, K extends Array<Expectation>>(data: T, expectations: K) => {
        return hydrator<T, K>(data, expectations, this.client, this.api);
    }

    // get author() {
    //     return this.client.users.get(this.author_id);
    // };

    /**
     * Reply to the message that this command
     * @param message The message to send to the channel
     * @param reference If true the message will be a reference the the message that triggered the command
     * @returns The message that was sent
     */
    public reply = async (message: Message | string, reference: boolean = true): Promise<MessagePayload> => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }

        if (reference) {
            message.setReference(this.message)
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
    public deleteMessage = (message_id: string): Promise<void> => {
        return this.api.delete(`/channels/${this.channel_id}/messages/${message_id ?? this.message_id}`).then(() => {});
    };

    /**
     * 
     * @name edit
     * @description Edits a message in the channel that this context is associated with.
     * @param {Message | string} message - The updated message content.
     * @returns {Promise<Message>} The updated message.
     */
    public async editMessage (message: Message, content?: string) {
        const clone = new Message(message);
        if (content) {
            clone.setContent(content);
        }
        return Message[fromDiscord](await this.api.patch<DiscordMessage>(`/channels/${clone.channel_id}/messages/${clone.id}`, clone));
    };
}