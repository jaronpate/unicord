import type { API } from "../services/api";
import type { Client } from "../services/client";
import { hydrate, hydrator, type Hydrateable, type Hydrated } from "../services/hydrator";
import { isNil, exists } from "../utils";
import { fromDiscord, InteractionResponseType, type Expectation } from "./common";
import type { Guild } from "./guild";
import type { InteractionPayload } from "./handler";
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
    message: Extract<Expectation.Message, T[number]> extends never ? undefined : Message;
};

export type ContextData =
    | { channel_id?: string; message_id?: string; guild_id?: string; message?: MessagePayload, interaction: InteractionPayload }
    | { channel_id?: string; message_id?: string; guild_id?: string; message: MessagePayload, interaction?: InteractionPayload };

export class Context<D extends ContextData = ContextData> {
    // Public properties
    message_id?: string;
    channel_id: string;
    guild_id?: string;
    message?: D extends { message: MessagePayload } ? MessagePayload : undefined;
    interaction?: D extends { interaction: InteractionPayload } ? InteractionPayload : undefined;

    constructor(private client: Client, private api: API, data: D) {
        const channel_id = data.channel_id ?? data.message?.channel_id ?? data.interaction?.channel_id;

        if (isNil(channel_id)) {
            throw new Error('Channel ID is required to create a context');
        }

        this.client = client;
        this.message_id = data.message_id ?? data.message?.id;
        this.channel_id = channel_id;
        this.guild_id = data.guild_id ?? data.message?.guild_id ?? data.interaction?.guild_id;
        this.message = data.message as D extends { message: MessagePayload } ? MessagePayload : undefined;
        this.interaction = data.interaction as D extends { interaction: InteractionPayload } ? InteractionPayload : undefined;
    }

    get self() {
        return this.client.self!;
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
    public hydrate = async <
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
    public hydrator = async <T extends Hydrateable | Hydrated<Hydrateable, Array<Expectation>>, K extends Array<Expectation>>(data: T, expectations: K) => {
        return hydrator<T, K>(data, expectations, this.client, this.api);
    }

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

        if (exists(this.interaction)) {
            return this.ack(InteractionResponseType.Message, message.toJSON());
        } else if (exists(this.message)) {
            if (reference) {
                message.setReference(this.message)
            }
            
            return this.client.sendMessage(this.channel_id, message);
        } else {
            throw new Error('Cannot reply without a message or interaction payload');
        }
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
    public editMessage = async (message: Message, content?: string) => {
        const clone = new Message(message);
        if (content) {
            clone.setContent(content);
        }
        return Message.fromDiscord(await this.api.patch<DiscordMessage>(`/channels/${clone.channel_id}/messages/${clone.id}`, clone));
    };

    // Interaction methods
    public ack = async (type: InteractionResponseType = InteractionResponseType.Pong, data?: Record<string, any>) => {
        if (isNil(this.interaction)) {
            throw new Error('Cannot acknowledge an interaction without an interaction payload');
        }

        return this.api.post(`/interactions/${this.interaction.id}/${this.interaction.token}/callback`, {
            type,
            data
        });
    };

    public defer = async () => {
        return this.ack(InteractionResponseType.DeferredMessage);
    };
}