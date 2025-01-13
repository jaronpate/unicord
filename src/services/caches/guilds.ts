import { Guild } from "../../types/guild";
import type { API } from "../api";
import type { Processor } from "../processor";
import { ObjectCache } from "./cache";

export class Guilds extends ObjectCache<Guild, Guild> {
    constructor (api: API, processor: Processor) {
        super(api, processor, 'guilds', Guild, ['GUILD_CREATE', 'GUILD_UPDATE']);
    }
}