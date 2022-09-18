import { Context, Gateway } from '.';

export class ObjectCache<T> {
    cache = new Map<string, T>();
    private readonly token: string;
    private readonly type: string;
    private readonly gateway: Gateway;

    constructor({ token, gateway, type, events }: { token: string; gateway: Gateway; type: string; events: string[] }) {
        this.token = token;
        this.type = type;
        this.gateway = gateway;
        gateway.handlers.register(events, (_client, _context: Context, e: Record<string, any>) => {
            this.cache.set(e.id, e as T);
        });
    }

    async fetch(object_id: string): Promise<T> {
        return this.gateway.api.get(`${this.type}/${object_id}`).then((res) => {
            const object: T & { id: string } = res.data;
            this.cache.set(object.id, object);
            return object;
        });
    }

    get(object_id: string): T | Promise<T> {
        if (this.cache.has(object_id)) {
            return Promise.resolve(this.cache.get(object_id)!);
        } else {
            return this.fetch(object_id);
        }
    }

    list(): Map<string, T> {
        return this.cache;
    }
}
