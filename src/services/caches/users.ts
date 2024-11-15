import { User } from "../../types/user";
import type { API } from "../api";
import type { Processor } from "../processor";
import { ObjectCache } from "./cache";


export class Users extends ObjectCache<User, User> {
    constructor (api: API, processor: Processor) {
        super(api, processor, 'users', User, []);
    }
}