import type { Unicord } from "..";
import { Guild } from "../types/guild";
import { UnicordObjectCache } from "./cache";

export class UnicordGuildsCache extends UnicordObjectCache<Guild> {
    constructor(self: Unicord) {
        super(self, 'guilds', Guild, ['GUILD_CREATE', 'GUILD_UPDATE']);
    }
}
