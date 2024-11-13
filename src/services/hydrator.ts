import { Expectation } from "../types/common";
import { Context, type HydratedContext } from "../types/context";
import { Message, type HydratedMessage } from "../types/message";
import { exists } from "../utils";
import type { API } from "./api";
import type { Client } from "./client";

export type GatewayObject = Message;
export type Hydrateable = Context | GatewayObject
export type Hydrated<T extends Hydrateable, K extends Array<Expectation>> = 
    T extends Message ? HydratedMessage<K> :
    T extends Context ? HydratedContext<K> : never;

export async function hydrator<T extends Hydrateable, K extends Array<Expectation>>(data: T, expectations: K, client: Client, api: API): Promise<(data: unknown) => data is Hydrated<T, K>> {
    let hydrated = true;

    if (data instanceof Context) {
        for (const expectation of expectations) {
            if (expectation === Expectation.Guild && exists(data.guild_id)) {
                let context = data as unknown as HydratedContext<[Expectation.Guild, ...Expectation[]]>;
                context.guild = await client.guilds.get(data.guild_id);
            } else {
                hydrated = false;
                break;
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
            } else {
                hydrated = false;
                break;
            }
        }
    }

    return function (data: unknown): data is Hydrated<T, K> {
        return hydrated;
    }
}