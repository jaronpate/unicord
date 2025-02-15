import { exists, isNil } from '../utils';
import { GatewayObject } from './base';
import type { Channel } from './channel';
import { fromDiscord, Trait, type Expectation } from './common';
import type { Embed } from './embed';
import type { Guild } from './guild';
import { User, type DiscordUser } from './user';

export type Component = Partial<Button | SelectMenu> & {
    type: ComponentType;
    content?: string;
    components?: Component[];
};

// {
//     content?: string;
//     type?: ComponentType;
//     description?: string;
//     label?: string;
//     value?: string;
//     style?: ComponentStyle;
//     custom_id?: string;
//     url?: string;
//     disabled?: boolean;
//     required?: boolean;
//     emoji?: {
//         name: string;
//         id?: string;
//         animated?: boolean;
//     }
//     options?: Component[];
//     placeholder?: string;
//     min_values?: number;
//     max_values?: number;
//     components?: Component[];
// }

export type DefaultReaction = {
    emoji_id?: string | null;   // the id of a guild's custom emoji
    emoji_name?: string | null; // the unicode character of the emoji
};

export type Emoji = {
    name: string | null;
    id: string | null;
    animated?: boolean;
};

export type Button = {
    style: ComponentStyle;
    label: string;
    emoji?: Emoji;
    custom_id?: string;
    url?: string;
    disabled?: boolean;
};

export type SelectMenu = {
    custom_id: string;
    options: {
        label: string;
        value: string;
        description?: string;
        emoji?: Emoji;
        default?: boolean;
    }[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
};

export enum ComponentStyle {
    Primary = 1,
    Secondary,
    Success,
    Danger,
    Link
}

export enum ComponentType {
    ActionRow = 1,
    Button,
    SelectMenu,
    TextInput,
    UserSelect,
    RoleSelect,
    MentionableSelect,
    ChannelSelect
}

export type HydratedMessage<T extends Array<Expectation>> = MessagePayload & {
    channel: Extract<Expectation.Channel, T[number]> extends never ? undefined : Channel;
    reference: Extract<Expectation.Message, T[number]> extends never ? undefined : MessagePayload;
    guild: Extract<Expectation.Guild, T[number]> extends never ? undefined : Guild;
}

export type MessagePayload = Message & {
    id: string;
    author: User;
    channel_id: string;
    content: string;
    embeds: Embed[];
    components: Component[];
    message_reference?: {
        id: string;
        channel_id: string;
        guild_id?: string;
    };
    timestamp: Date;
};

export class Message extends GatewayObject {
    id?: string;
    author?: User;
    channel_id?: string;
    guild_id?: string;
    public content: string;
    public embeds: Embed[] = [];
    public components: Component[] = [];
    public message_reference?: {
        id: string;
        channel_id: string;
        guild_id?: string;
    };
    timestamp?: Date;

    constructor(data?: Partial<Message>) {
        super();
        this.id = data?.id;
        this.author = data?.author;
        this.channel_id = data?.channel_id;
        this.guild_id = data?.guild_id;
        this.content = data?.content ?? '';
        this.message_reference = data?.message_reference;
        this.timestamp = data?.timestamp;
    };

    // NOTE: Overriden here because the `fromDiscord` method returns a `MessagePayload` object
    // and the GatewayObject getter overrides the return type to `Message`
    // TODO: Fix type in GatewayObject so this override is not needed
    public static get fromDiscord() {
        return this[Trait.fromDiscord];
    }

    public static [Trait.fromDiscord]<T = MessagePayload>(data: DiscordMessage): T {
        return new Message({
            id: data.id,
            author: User[fromDiscord](data.author),
            channel_id: data.channel_id,
            guild_id: data.guild_id,
            content: data.content,
            // TODO: Add embeds
            // embeds: data.embeds.map(embed => Embed.fromDiscord(embed)),
            // TODO: Add components
            // components: data.components,
            message_reference: exists(data.message_reference) ? {
                id: data.message_reference.message_id,
                channel_id: data.message_reference.channel_id,
                guild_id: data.message_reference.guild_id
            } : undefined,
            timestamp: new Date(data.timestamp)
        }) as T;
    };

    public static button(config: Button): Component {
        return {
            type: ComponentType.Button,
            ...config
        };
    };

    public static selectMenu(config: SelectMenu): Component {
        return {
            type: ComponentType.SelectMenu,
            ...config
        };
    };

    public setContent = (content: string) => {
        this.content = content;
        return this;
    };

    public addEmbed = (embed: Embed) => {
        this.embeds.push(embed);
        return this;
    };

    public addComponent = (content: Component | string, ...components: Component[]) => {
        if (typeof content === 'string') {
            this.components.push({
                type: ComponentType.ActionRow,
                content,
                components
            });
        } else {
            this.components.push({
                type: ComponentType.ActionRow,
                components: [content, ...components]
            });
        }
        return this;
    };

    public setReference = (message: Message | Partial<Message>) => {
        if (isNil(message.id) || isNil(message.channel_id)) {
            throw new Error('Message ID and Channel ID are required');
        }

        let ref: Message;

        if (!(message instanceof Message)) {
            ref = new Message(message);
        } else {
            ref = message;
        }

        this.message_reference = {
            id: ref.id!,
            channel_id: ref.channel_id!,
            guild_id: ref.guild_id
        };
        return this;
    };

    public toJSON = () => {
        return {
            content: this.content,
            embeds: this.embeds,
            components: this.components,
            message_reference: this.message_reference ? {
                message_id: this.message_reference.id,
                channel_id: this.message_reference.channel_id,
                guild_id: this.message_reference.guild_id
            } : undefined
        };
    };
}

// Raw API Object
export type DiscordMessage = {
    id: string;
    channel_id: string;
    guild_id?: string;
    author: DiscordUser;
    // member?: DiscordGuildMember;
    content: string;
    // ISO8601 timestamp
    timestamp: string;
    edited_timestamp: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: DiscordUser[];
    mention_roles: string[];
    mention_channels?: { id: string; guild_id: string; type: number; name: string }[];
    attachments: { id: string; filename: string; url: string; proxy_url: string; size: number }[];
    // embeds: DiscordEmbed[];
    reactions?: { count: number; me: boolean; emoji: Emoji }[];
    nonce?: string | number;
    pinned: boolean;
    webhook_id?: string;
    type: number;
    activity?: { type: number; party_id?: string };
    application?: { id: string; cover_image?: string; description: string; icon?: string; name: string };
    application_id?: string;
    message_reference?: { message_id: string; channel_id: string; guild_id?: string; fail_if_not_exists?: boolean };
    flags?: number;
    referenced_message?: DiscordMessage | null;
    interaction?: { id: string; type: number; name: string; user: DiscordUser };
    thread?: { id: string; name: string; type: number };
    components?: any[];
    sticker_items?: { id: string; name: string; format_type: number }[];
    stickers?: {
        id: string;
        pack_id?: string;
        name: string;
        description?: string;
        tags: string;
        asset: string;
        preview_asset?: string;
        format_type: number;
    }[];
}
