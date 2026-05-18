import type { Expects, Unicord } from '.';
import { Expectation } from '.';
import { UnicordCommandContext } from './context';
import type { Channel, Guild, Message } from './types';
import { exists } from './utils';

export type UnicordHydrateable = UnicordCommandContext;

export type UnicordHydratedObject<Object, Expectations extends Array<Expectation>> = Object & {
    channel: Expects<Expectations, Expectation.Channel, Channel>;
    guild: Expects<Expectations, Expectation.Guild, Guild>;
    message: Expects<Expectations, Expectation.Message, Message>;
};

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
export async function hydrate<T extends UnicordHydrateable, K extends Array<Expectation>>(
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
            //     let context = data as unknown as UnicordHydratedObject<T, [Expectation.Message]>;
            //     context.message = await self.caches.messages.get(data.channel_id, data.message_id);
            // } else if (expectation === Expectation.Guild && exists(data.guild_id)) {
            if (expectation === Expectation.Guild && exists(data.guild_id)) {
                let context = data as unknown as UnicordHydratedObject<T, [Expectation.Guild]>;
                context.guild = await self.caches.guilds.get(data.guild_id);
            } else if (expectation === Expectation.Channel && exists(data.channel_id)) {
                let context = data as unknown as UnicordHydratedObject<T, [Expectation.Channel]>;
                context.channel = await self.caches.channels.get(data.channel_id);
            } else if (expectation === Expectation.Message && exists(data.message)) {
                let context = data as unknown as UnicordHydratedObject<T, [Expectation.Message]>;
                context.message = data.message;
            } else {
                throw new Error(`Invalid expectation requested for Context: ${expectation}`);
            }
        }
    } else {
        throw new Error(`Hydration for the provided type is not implemented.`);
    }

    // Ensure the result is properly typed with both old and new hydrated properties
    return data as T & UnicordHydratedObject<T, K>;
}
