import type { Expects, Unicord } from '.';
import { Expectation } from '.';
import { UnicordCommandContext } from './context';
import type { Channel, Guild, Message } from './types';
import { exists } from './utils';

export type Hydrateable = UnicordCommandContext;

export type UnicordHydratedObject<Object, Expectations extends Array<Expectation>> = Object & {
    channel: Expects<Expectations, Expectation.Channel, Channel>;
    guild: Expects<Expectations, Expectation.Guild, Guild>;
    message: Expects<Expectations, Expectation.Message, Message>;
};

export type Hydrated<Object extends Hydrateable, Expectations extends Array<Expectation>> = UnicordHydratedObject<
    Object,
    Expectations
>;

// export type Hydrated<T extends Hydrateable, K extends Array<Expectation>> = T extends UnicordCommandContext
//     ? HydratedCommandContext<K>
//     : never;

// NOTE: Dont forget to update the typedoc comment in src/index.ts and src/context.ts when making changes here
/**
 * Hydrates a given data object based on the provided expectations.
 *
 * @param self - The client instance used to fetch additional data required for hydration.
 * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
 * @param expectations - An array of expectations that specify what properties should be hydrated.
 *
 * @returns A promise that resolves to the hydrated data object.
 *
 * @throws Will throw an error if an expectation cannot be resolved.
 */
export async function hydrate<T extends Hydrateable, K extends Array<Expectation>>(
    self: Unicord,
    data: T,
    expectations: K,
): Promise<UnicordHydratedObject<T, K>> {
    // TODO: add clone trait. Make it a requirement for hydrateable objects.
    // Then clone the object and return the hydrated object.
    let hydrated: UnicordHydratedObject<T, K>;

    if (data instanceof UnicordCommandContext) {
        for (const expectation of expectations) {
            // if (expectation === Expectation.Message && exists(data.message_id)) {
            //     let context = data as unknown as UnicordHydratedObject<[Expectation.Message, ...Expectation[]]>;
            //     context.message = await self.caches.messages.get(data.channel_id, data.message_id);
            // } else if (expectation === Expectation.Guild && exists(data.guild_id)) {
            if (expectation === Expectation.Guild && exists(data.guild_id)) {
                let context = data as unknown as UnicordHydratedObject<UnicordCommandContext, [Expectation.Guild]>;
                context.guild = await self.caches.guilds.get(data.guild_id);
            } else if (expectation === Expectation.Channel && exists(data.channel_id)) {
                let context = data as unknown as UnicordHydratedObject<UnicordCommandContext, [Expectation.Channel]>;
                context.channel = await self.caches.channels.get(data.channel_id);
            } else {
                throw new Error(`Invalid expectation requested for Context: ${expectation}`);
            }
        }
    } else {
        throw new Error(`Hydration for the provided type is not implemented.`);
    }

    // Create a new object that preserves all existing properties
    const result = { ...data } as any;

    // Ensure the result is properly typed with both old and new hydrated properties
    return result as T & Hydrated<T, K>;
}
