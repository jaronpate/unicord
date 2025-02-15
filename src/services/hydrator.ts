import { Expectation } from "../types/common";
import { Context, type HydratedContext } from "../types/context";
import { Message, type HydratedMessage } from "../types/message";
import { Channel } from "../types/channel";
import { exists } from "../utils";
import type { API } from "./api";
import type { Client } from "./client";

export type GatewayObject = Message | Channel;
export type Hydrateable = Context | GatewayObject
export type Hydrated<T extends Hydrateable, K extends Array<Expectation>> =
    T extends Message ? HydratedMessage<K> & Partial<HydratedMessage<Expectation[]>> :
    T extends Context ? HydratedContext<K> & Partial<HydratedContext<Expectation[]>> : never;

/**
 * Hydrates a given data object based on the provided expectations.
 * 
 * @template T - The type of the data object to be hydrated. Must extend `Hydrateable`.
 * @template K - An array of `Expectation` types that specify what properties should be hydrated.
 * 
 * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
 * @param expectations - An array of expectations that specify what properties should be hydrated.
 * @param client - The client instance used to fetch additional data required for hydration.
 * @param api - The API instance used to fetch additional data required for hydration.
 * 
 * @returns A promise that resolves to the hydrated data object.
 * 
 * @throws Will throw an error if an expectation cannot be resolved.
 */
export async function hydrate<T extends Hydrateable, K extends Array<Expectation>>(
    data: T,
    expectations: K,
    client: Client,
    api: API
): Promise<Hydrated<T, K>> {
    // TODO: add clone trait. Make it a requirement for hydrateable objects.
    // Then clone the object and return the hydrated object.
    let hydrated: Hydrated<T, K>;

    if (data instanceof Context) {
        for (const expectation of expectations) {
            if (expectation === Expectation.Message && exists(data.message_id)) {
                let context = data as unknown as HydratedContext<[Expectation.Message, ...Expectation[]]>;
                context.message = await client.messages.get(data.channel_id, data.message_id);
            } else if (expectation === Expectation.Guild && exists(data.guild_id)) {
                let context = data as unknown as HydratedContext<[Expectation.Guild, ...Expectation[]]>;
                context.guild = await client.guilds.get(data.guild_id);
            } else if (expectation === Expectation.Channel && exists(data.channel_id)) {
                let context = data as unknown as HydratedContext<[Expectation.Channel, ...Expectation[]]>;
                context.channel = await client.channels.get(data.channel_id);
            } else {
                throw new Error(`Invalid expectation requested for Context: ${expectation}`);
            }
        }
    } else if (data instanceof Message) {
        for (const expectation of expectations) {
            if (expectation === Expectation.Message && exists(data.message_reference?.id)) {
                let message = data as unknown as HydratedMessage<[Expectation.Message, ...Expectation[]]>;
                message.reference = await client.messages.get(data.message_reference.channel_id, data.message_reference.id);
            } else if (expectation === Expectation.Guild && exists(data.guild_id)) {
                let message = data as unknown as HydratedMessage<[Expectation.Guild, ...Expectation[]]>;
                message.guild = await client.guilds.get(data.guild_id);
            } else if (expectation === Expectation.Channel && exists(data.channel_id)) {
                let message = data as unknown as HydratedMessage<[Expectation.Channel, ...Expectation[]]>;
                message.channel = await client.channels.get(data.channel_id);
            } else {
                throw new Error(`Invalid expectation requested for Message: ${expectation}`);
            }
        }
    }

    // Create a new object that preserves all existing properties
    const result = { ...data };
    
    // Return with both previous and new hydrated properties preserved
    return result as Hydrated<T, K>;
}

/**
 * A wrapper function that attempts to hydrate a given data object and returns a type guard function.
 * 
 * @template T - The type of the data object to be hydrated. Must extend `Hydrateable`.
 * @template K - An array of `Expectation` types that specify what properties should be hydrated.
 * 
 * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
 * @param expectations - An array of expectations that specify what properties should be hydrated.
 * @param client - The client instance used to fetch additional data required for hydration.
 * @param api - The API instance used to fetch additional data required for hydration.
 * 
 * @returns A promise that resolves to a type guard function. The type guard function returns `true` if the data object was successfully hydrated, otherwise `false`.
 */
export async function hydrator<T extends Hydrateable, K extends Array<Expectation>>(
    data: T,
    expectations: K,
    client: Client,
    api: API
): Promise<(data: unknown) => data is Hydrated<T, K>> {
    let hydrated = true;

    try {
        // TODO: When clone is implemented we will receive a clone of the object here
        // So in hydrator we will need to copy the properties from the clone to the original object
        await hydrate(data, expectations, client, api);
    } catch (error) {
        hydrated = false;
    }

    // BUG: Resolves to never after hydrations on an already hydrated object
    return function (data: unknown): data is Hydrated<T, K> {
        return hydrated;
    }
}
