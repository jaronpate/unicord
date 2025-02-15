import { Channel } from "../../types/channel";
import type { API } from "../api";
import type { Processor } from "../processor";
import { ObjectCache } from "./cache";

export class Channels extends ObjectCache<Channel, Channel> {
    constructor (api: API, processor: Processor) {
        super(api, processor, 'channels', Channel, ['CHANNEL_CREATE', 'CHANNEL_UPDATE']);
    }
}