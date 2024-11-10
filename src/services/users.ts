import type { User } from "../types/user";
import type { API } from "./api";
import { ObjectCache } from "./cache";
import type { Processor } from "./processor";

export class Users extends ObjectCache<User> {
    constructor (api: API, processor: Processor) {
        super(api, processor, 'users', []);
    }
}