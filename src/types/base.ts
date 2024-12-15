import { Trait } from "./common";

export abstract class GatewayObject {
    constructor() {}

    // TODO: Add a clone method to subclasses
    // public abstract [Trait.clone]<T extends GatewayObject>(this: new (data: any) => T): T;

    // public get clone() {
    //     return this[Trait.clone];
    // }

    static [Trait.fromDiscord]<T extends GatewayObject>(this: new (...args: any[]) => T, data: any): T {
        throw new Error('Method should be overridden - you should not see this. If you do, please report it.');
    };

    static get fromDiscord() {
        return this[Trait.fromDiscord];
    }
}