import { fromDiscord } from "../../types/common";
import type { Context } from "../../types/context";
import type { API } from "../api";
import type { Processor } from "../processor";


export class ObjectCache<T, K extends T> {
    cache: LRUCache<string, K>;
    requests = new Map<string, Promise<K>>();
    readonly type: string;

    constructor(protected api: API, processor: Processor, type: string, private readonly factory: { [fromDiscord]: (data: any) => K } & (new (data: T) => T), events: string[], capacity: number = 10_000) {
        this.cache = new LRUCache<string, K>(10_000)
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
}

class ListNode<K, V> {
    key: K;
    value: V;
    prev: ListNode<K, V> | null = null;
    next: ListNode<K, V> | null = null;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache<K, V> {
    private capacity: number;
    private map: Map<K, ListNode<K, V>>;
    private head: ListNode<K, V>;
    private tail: ListNode<K, V>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();

        // Dummy head and tail to simplify boundary conditions
        this.head = new ListNode<K, V>(null as any, null as any);
        this.tail = new ListNode<K, V>(null as any, null as any);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    get(key: K): V | undefined {
        if (!this.map.has(key)) return undefined;

        const node = this.map.get(key)!;
        this.moveToFront(node);
        return node.value;
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    set(key: K, value: V): void {
        if (this.map.has(key)) {
            // Update existing node value and move it to front
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToFront(node);
        } else {
            // Create a new node
            const newNode = new ListNode(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);

            // If over capacity, remove the least recently used (LRU) node
            if (this.map.size > this.capacity) {
                this.removeLRU();
            }
        }
    }

    private moveToFront(node: ListNode<K, V>): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    private addToFront(node: ListNode<K, V>): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    private removeNode(node: ListNode<K, V>): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private removeLRU(): void {
        const lruNode = this.tail.prev!;
        this.removeNode(lruNode);
        this.map.delete(lruNode.key);
    }

    *[Symbol.iterator](): IterableIterator<[K, V]> {
        let current = this.head.next;
        while (current && current !== this.tail) {
            yield [current.key, current.value];
            current = current.next;
        }
    }
}