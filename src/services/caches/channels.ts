import { API } from "../api";
import { Processor } from "../processor";
import { Channel } from "../../types/channel";
import { ObjectCache } from "./cache";

export class Channels extends ObjectCache<Channel, Channel> {
    constructor(api: API, processor: Processor) {
        super(api, processor, 'channels', Channel, ['CHANNEL_CREATE', 'CHANNEL_UPDATE']);
    }
}
