import type { Unicord } from '.';
import { hydrate } from './hydrator';
import type { MessagePayload } from './types';
import { Message } from './types';
import { exists, isNil } from './utils';

export type UnicordCommandContextInput =
    | {
          message: MessagePayload;
          channel_id?: string;
          message_id?: string;
          guild_id?: string;
      }
    | {
          channel_id: string;
          message_id: string;
          guild_id?: string;
          message?: MessagePayload;
      };


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
 * @param {Unicord} self - The client instance.
 * @param {UnicordCommandContextInput} data - The payload data for the context.
 *
 * @throws {Error} If the message ID is not provided.
 * @throws {Error} If the channel ID is not provided.
 */
export class UnicordCommandContext {
    // Public properties
    message_id: string;
    channel_id: string;
    guild_id?: string;

    message?: Message;

    constructor(private self: Unicord, data: UnicordCommandContextInput) {
        if (isNil(data.message)) {
            if (isNil(data.message_id)) {
                throw new Error('Message ID is required to create a context');
            }

            if (isNil(data.channel_id)) {
                throw new Error('Channel ID is required to create a context');
            }

            this.message_id = data.message_id;
            this.channel_id = data.channel_id;
            this.guild_id = data.guild_id;
        } else {
            this.message = data.message;
            this.message_id = data.message.id;
            this.channel_id = data.message.channel_id;
            this.guild_id = data.message.guild_id;
        }
    }

    /**
     * Reply to the message that this command
     * @param message The message to send to the channel
     * @param reference If true the message will be a reference the the message that triggered the command
     * @returns The message that was sent
     */
    public reply = async (message: Message | string, reference: boolean = true): Promise<Message> => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }

        if (exists(this.message)) {
            if (reference) {
                message.setReference(this.message);
            }

            return this.self.sendMessage(this.channel_id, message);
        } else {
            throw new Error('Cannot reply without a message payload');
        }
    };

    /**
     * Hydrates a given data object based on the provided expectations.
     *
     * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
     * @param expectations - An array of expectations that specify what properties should be hydrated.
     *
     * @returns A promise that resolves to the hydrated data object.
     *
     * @throws Will throw an error if an expectation cannot be resolved.
     */
    get hydrate() {
        return hydrate.bind(null, this.self);
    }
}
