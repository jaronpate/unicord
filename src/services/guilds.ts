import { Guild } from "../types/guild";
import type { API } from "./api";
import { ObjectCache } from "./cache";
import type { Processor } from "./processor";

export class Guilds extends ObjectCache<Guild> {
    constructor (api: API, processor: Processor) {
        super(api, processor, 'guilds', Guild.factory, ['GUILD_CREATE', 'GUILD_UPDATE']);
    }
}