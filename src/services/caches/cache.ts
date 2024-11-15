import { fromDiscord } from "../../types/common";
import type { Context } from "../../types/context";
import type { API } from "../api";
import type { Processor } from "../processor";


export class ObjectCache<T, K extends T> {
    cache = new Map<string, K>();
    requests = new Map<string, Promise<K>>();
    readonly type: string;

    constructor(protected api: API, processor: Processor, type: string, private readonly factory: { [fromDiscord]: (data: any) => K } & (new (data: T) => T), events: string[]) {
        this.type = type;
        processor.events.register(events, async (_context: Context, e: Record<string, any>) => {
            this.cache.set(e.id, factory[fromDiscord](e));
        });
    }

    set(object_id: string, object: K): void {
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

    async fetch(object_id: string, ..._args: any[]): Promise<K> {
        if (this.requests.has(object_id)) {
            return this.requests.get(object_id)!;
        // } else if (this.cache.has(object_id)) {
        //     return Promise.resolve(this.cache.get(object_id)!);
        } else {
            // Dispatch the request
            const req = this.api.get(`/${this.type}/${object_id}`).then((data) => {
                // Create the object
                const object = this.factory[fromDiscord](data);
                // Save the object
                this.cache.set(object_id, object);
                // Return the object
                return object;
            });
            // Save the request
            this.requests.set(object_id, req);
            // Remove the request from the cache if it succeeds
            req.then(() => this.requests.delete(object_id));
            // Remove the request from the cache if it fails
            req.catch(() => this.requests.delete(object_id));
            // Return the request
            return req;
        }
    }

    async get(object_id: string, ..._args: any[]): Promise<K> {
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
