import { fromDiscord } from "../../types/common";
import { Message, type MessagePayload } from "../../types/message";
import type { API } from "../api";
import type { Processor } from "../processor";
import { ObjectCache } from "./cache";


export class Messages extends ObjectCache<Message, MessagePayload> {
    constructor (api: API, processor: Processor) {
        super(api, processor, 'messages', Message, ['MESSAGE_CREATE', 'MESSAGE_UPDATE']);
    }

    async fetch(channel_id: string, message_id: string): Promise<MessagePayload> {
        if (this.requests.has(message_id)) {
            return this.requests.get(message_id)!;
        } else {
            // Dispatch the request
            const req = this.api.get(`/channels/${channel_id}/messages/${message_id}`).then((data) => {
                const message = Message[fromDiscord](data);
                this.cache.set(message_id, message);
                return message;
            });
            // Save the request
            this.requests.set(message_id, req);
            // Remove the request from the cache if it succeeds
            req.then(() => this.requests.delete(message_id));
            // Remove the request from the cache if it fails
            req.catch(() => this.requests.delete(message_id));
            // Return the request
            return req;
        }
    }

    async get(channel_id: string, message_id: string): Promise<MessagePayload> {
        if (this.cache.has(message_id)) {
            return await Promise.resolve(this.cache.get(message_id)!);
        } else {
            return this.fetch(channel_id, message_id);
        }
    }
}