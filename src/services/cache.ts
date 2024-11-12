import type { Context } from "../types/context";
import { exists } from "../utils";
import type { API } from "./api";
import type { Processor } from "./processor";

export class ObjectCache<T> {
    cache = new Map<string, Promise<T> | T>();
    readonly type: string;

    constructor(protected api: API, processor: Processor, type: string, private readonly factory: (...args: any[]) => Promise<T>, events: string[]) {
        this.type = type;
        processor.events.register(events, async (_context: Context, e: Record<string, any>) => {
            this.cache.set(e.id, factory(e));
        });
    }

    set(object_id: string, object: T): void {
        this.cache.set(object_id, object);
    }

    // update(object_id: string, object: Partial<T>): void {
    //     const existing = this.cache.get(object_id);

    //     if (exists(existing)) {
    //         // TODO: Idk wtf happens if this is called on two classes
    //         this.cache.set(object_id, { ...existing, ...object });
    //     } else {
    //         this.cache.set(object_id, object as T);
    //     }
    // }

    async fetch(object_id: string, ..._args: any[]): Promise<T> {
        const req = this.api.get(`/${this.type}/${object_id}`).then((data) => this.factory(data));
        this.cache.set(object_id, req);
        req.catch(() => this.cache.delete(object_id));
        return await req;
    }

    async get(object_id: string, ..._args: any[]): Promise<T> {
        if (this.cache.has(object_id)) {
            return await Promise.resolve(this.cache.get(object_id)!);
        } else {
            return this.fetch(object_id);
        }
    }

    list(): Map<string, Promise<T> | T> {
        return this.cache;
    }
}
