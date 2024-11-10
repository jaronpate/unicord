import type { Context } from "../types/context";
import { exists } from "../utils";
import type { API } from "./api";
import type { Processor } from "./processor";


export class ObjectCache<T> {
    cache = new Map<string, T>();
    private readonly type: string;

    constructor(private api: API, processor: Processor, type: string, events: string[]) {
        this.type = type;
        processor.events.register(events, (_context: Context, e: Record<string, any>) => {
            this.cache.set(e.id, e as T);
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

    async fetch(object_id: string): Promise<T> {
        return this.api.get(`${this.type}/${object_id}`).then((res) => {
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
