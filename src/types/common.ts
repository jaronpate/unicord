import type { Client } from "../services/client";
import type { Context } from "./context";
import type { BaseHandler } from "./hander";

export type ClientConfig = {
    token: string;
    application_id: string;
    prefix?: string;
    intents?: Intent[];
}
export enum HandlerType {
    Events = 'events',
    ChatCommands = 'chat_commands',
    SlashCommands = 'slash_commands',
    Interactions = 'interactions'
}


export type EventPayload = any;

export type Primitive = string | number | boolean | null;

/**
 * Represents a payload structure used in the Discord API.
 * 
 * @typedef {Object} Payload
 * @property {number} op - The opcode of the payload.
 * @property {Record<string, any>} d - The data associated with the payload.
 * @property {number | null} s - The sequence number, or null if not applicable.
 * @property {string | null} t - The event name, or null if not applicable.
 */
export type Payload = {
    op: number;
    d: Record<string, any> | Primitive | null;
    s: number | null;
    t: string | null;
};

export enum Intent {
    GUILDS = 1 << 0,
    GUILD_MEMBERS = 1 << 1,
    GUILD_BANS = 1 << 2,
    GUILD_EMOJIS_AND_STICKERS = 1 << 3,
    GUILD_INTEGRATIONS = 1 << 4,
    GUILD_WEBHOOKS = 1 << 5,
    GUILD_INVITES = 1 << 6,
    GUILD_VOICE_STATES = 1 << 7,
    GUILD_PRESENCES = 1 << 8,
    GUILD_MESSAGES = 1 << 9,
    GUILD_MESSAGE_REACTIONS = 1 << 10,
    GUILD_MESSAGE_TYPING = 1 << 11,
    DIRECT_MESSAGES = 1 << 12,
    DIRECT_MESSAGE_REACTIONS = 1 << 13,
    DIRECT_MESSAGE_TYPING = 1 << 14,
    MESSAGE_CONTENT = 1 << 15,
    DEFAULT = 513,
    ALL = 32767
}

export const IntentGroup : {[key in Intent]?: [string[], number]} = {
    [Intent.GUILDS]: [[
      "GUILD_CREATE",
      "GUILD_UPDATE",
      "GUILD_DELETE",
      "GUILD_ROLE_CREATE",
      "GUILD_ROLE_UPDATE",
      "GUILD_ROLE_DELETE",
      "CHANNEL_CREATE",
      "CHANNEL_UPDATE",
      "CHANNEL_DELETE",
      "CHANNEL_PINS_UPDATE",
      "THREAD_CREATE",
      "THREAD_UPDATE",
      "THREAD_DELETE",
      "THREAD_LIST_SYNC",
      "THREAD_MEMBER_UPDATE",
      "THREAD_MEMBERS_UPDATE *",
      "STAGE_INSTANCE_CREATE",
      "STAGE_INSTANCE_UPDATE",
      "STAGE_INSTANCE_DELETE"
    ], 0],
  
    [Intent.GUILD_MEMBERS]: [[
      "GUILD_MEMBER_ADD",
      "GUILD_MEMBER_UPDATE",
      "GUILD_MEMBER_REMOVE",
      "THREAD_MEMBERS_UPDATE *",
    ], 1], 
  
    [Intent.GUILD_BANS]: [[
      "GUILD_BAN_ADD",
      "GUILD_BAN_REMOVE",
    ], 2],
  
    [Intent.GUILD_EMOJIS_AND_STICKERS]: [[
      "GUILD_EMOJIS_UPDATE",
      "GUILD_STICKERS_UPDATE",
    ], 3],
  
    [Intent.GUILD_INTEGRATIONS]: [[
      "GUILD_INTEGRATIONS_UPDATE",
      "INTEGRATION_CREATE",
      "INTEGRATION_UPDATE",
      "INTEGRATION_DELETE",
    ], 4],
  
    [Intent.GUILD_WEBHOOKS]: [[
      "WEBHOOKS_UPDATE"
    ], 5],
  
    [Intent.GUILD_INVITES]: [[
      "INVITE_CREATE",
      "INVITE_DELETE",
    ], 6],
  
    [Intent.GUILD_VOICE_STATES]: [[
      "VOICE_STATE_UPDATE"
    ], 7],
  
    [Intent.GUILD_PRESENCES]: [[
      "PRESENCE_UPDATE"
    ], 8],
  
    [Intent.GUILD_MESSAGES]: [[
      "MESSAGE_CREATE",
      "MESSAGE_UPDATE",
      "MESSAGE_DELETE",
      "MESSAGE_DELETE_BULK",
    ], 9],
  
    [Intent.GUILD_MESSAGE_REACTIONS]: [[
      "MESSAGE_REACTION_ADD",
      "MESSAGE_REACTION_REMOVE",
      "MESSAGE_REACTION_REMOVE_ALL",
      "MESSAGE_REACTION_REMOVE_EMOJI",
    ], 10],
  
    [Intent.GUILD_MESSAGE_TYPING]: [[
      "TYPING_START"
    ], 11],
  
    [Intent.DIRECT_MESSAGES]: [[
      "MESSAGE_CREATE",
      "MESSAGE_UPDATE",
      "MESSAGE_DELETE",
      "CHANNEL_PINS_UPDATE",
    ], 12],
  
    [Intent.DIRECT_MESSAGE_REACTIONS]: [[
      "MESSAGE_REACTION_ADD",
      "MESSAGE_REACTION_REMOVE",
      "MESSAGE_REACTION_REMOVE_ALL",
      "MESSAGE_REACTION_REMOVE_EMOJI",
    ], 13],
  
    [Intent.DIRECT_MESSAGE_TYPING]: [[
      "TYPING_START"
    ], 14],
  
    [Intent.MESSAGE_CONTENT]: [[
      "MESSAGE_CONTENT"
    ], 15]
  }