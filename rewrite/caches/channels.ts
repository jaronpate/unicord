
import type { Unicord } from "..";
import { Channel } from "../types/channel";
import { UnicordObjectCache } from "./cache";

export class UnicordChannelsCache extends UnicordObjectCache<Channel> {
    constructor(self: Unicord) {
        super(self, 'channels', Channel, ['CHANNEL_CREATE', 'CHANNEL_UPDATE']);
    }
}
