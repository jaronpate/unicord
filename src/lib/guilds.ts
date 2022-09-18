import { Gateway, ObjectCache } from ".";
import { Guild } from "../types";

export class Guilds extends ObjectCache<Guild> {
    constructor ({ token, gateway }: { token: string, gateway: Gateway }) {
        super({token, gateway, type: 'guilds', events: ['GUILD_CREATE', 'GUILD_UPDATE']});
    }
}