import { Message } from "../types/message";
import type { API } from "./api";
import { ObjectCache } from "./cache";
import type { Client } from "./client";
import type { Processor } from "./processor";

export class Messages extends ObjectCache<Message> {
    constructor (protected client: Client, api: API, processor: Processor) {
        super(api, processor, 'message', (data) => Message.factory(data, client, api), ['MESSAGE_CREATE', 'MESSAGE_UPDATE']);
    }

    async fetch(channel_id: string, message_id: string, resolveReference: boolean = true): Promise<Message> {
        const req = this.api.get(`/channels/${channel_id}/messages/${message_id}`).then((data) => Message.factory(data, this.client, this.api, undefined, resolveReference));
        this.cache.set(message_id, req);
        req.catch(() => this.cache.delete(message_id));
        return await req;
    }

    async get(channel_id: string, message_id: string, resolveReference: boolean = true): Promise<Message> {
        if (this.cache.has(message_id)) {
            return await Promise.resolve(this.cache.get(message_id)!);
        } else {
            return this.fetch(channel_id, message_id, resolveReference);
        }
    }
}