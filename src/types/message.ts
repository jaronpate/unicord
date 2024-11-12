import type { API } from '../services/api';
import type { Client } from '../services/client';
import { isNil } from '../utils';
import { Embed } from './embed';
import { DiscordUser, User } from './user';

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

export class Message {
    id?: string;
    author?: User;
    channel_id?: string;
    guild_id?: string;
    public content: string;
    public embeds: Embed[] = [];
    public components: Component[] = [];
    public reference?: Message;
    timestamp: Date;

    constructor(data?: Partial<Message>) {
        this.id = data?.id;
        this.author = data?.author;
        this.channel_id = data?.channel_id;
        this.guild_id = data?.guild_id;
        this.content = data?.content ?? '';
        this.reference = data?.reference;
        this.timestamp = data?.timestamp ?? new Date();
    }

    public static factory = async (data: any, client: Client, api: API, resolveReference: boolean = true): Promise<Message> => {
        return Message.hydrate(DiscordMessage.fromAPIResponse(data), client, api, resolveReference);
    }

    public static hydrate = async (discord_message: DiscordMessage, client: Client, api: API, resolveReference: boolean = true): Promise<Message> => {
        let reference: Message | undefined;
        
        if (discord_message.message_reference && resolveReference) {
            const { channel_id, message_id } = discord_message.message_reference;
            reference = await client.messages.get(channel_id, message_id, false);
        }

        return new Message({
            id: discord_message.id,
            author: User.hydrate(discord_message.author),
            channel_id: discord_message.channel_id,
            guild_id: discord_message?.guild_id,
            content: discord_message.content,
            reference,
            timestamp: new Date(discord_message.timestamp)
        });
    }

    public static button(config: Button): Component {
        return {
            type: ComponentType.Button,
            ...config
        };
    }

    public static selectMenu(config: SelectMenu): Component {
        return {
            type: ComponentType.SelectMenu,
            ...config
        };
    }

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

        this.reference = ref;
        return this;
    };

    public toJSON = () => {
        return {
            content: this.content,
            embeds: this.embeds,
            components: this.components,
            message_reference: {
                message_id: this.reference?.id,
                channel_id: this.reference?.channel_id,
                guild_id: this.reference?.guild_id,
                fail_if_not_exists: false
            }
        };
    };
}

// Raw API Class
export class DiscordMessage {
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

    constructor(data: DiscordMessage) {
        this.id = data.id;
        this.channel_id = data.channel_id;
        this.guild_id = data.guild_id;
        this.author = data.author;
        // this.member = data.member;
        this.content = data.content;
        this.timestamp = data.timestamp;
        this.edited_timestamp = data.edited_timestamp;
        this.tts = data.tts;
        this.mention_everyone = data.mention_everyone;
        this.mentions = data.mentions;
        this.mention_roles = data.mention_roles;
        this.mention_channels = data.mention_channels;
        this.attachments = data.attachments;
        // this.embeds = data.embeds;
        this.reactions = data.reactions;
        this.nonce = data.nonce;
        this.pinned = data.pinned;
        this.webhook_id = data.webhook_id;
        this.type = data.type;
        this.activity = data.activity;
        this.application = data.application;
        this.application_id = data.application_id;
        this.message_reference = data.message_reference;
        this.flags = data.flags;
        this.referenced_message = data.referenced_message;
        this.interaction = data.interaction;
        this.thread = data.thread;
        this.components = data.components;
        this.sticker_items = data.sticker_items;
        this.stickers = data.stickers;
    }

    static fromAPIResponse(data: any): DiscordMessage {
        return new DiscordMessage({
            id: data.id,
            channel_id: data.channel_id,
            guild_id: data.guild_id,
            author: data.author,
            // member: data.member,
            content: data.content,
            timestamp: data.timestamp,
            edited_timestamp: data.edited_timestamp,
            tts: data.tts,
            mention_everyone: data.mention_everyone,
            mentions: data.mentions,
            mention_roles: data.mention_roles,
            mention_channels: data.mention_channels,
            attachments: data.attachments,
            // embeds: data.embeds,
            reactions: data.reactions,
            nonce: data.nonce,
            pinned: data.pinned,
            webhook_id: data.webhook_id,
            type: data.type,
            activity: data.activity,
            application: data.application,
            application_id: data.application_id,
            message_reference: data.message_reference,
            flags: data.flags,
            referenced_message: data.referenced_message,
            interaction: data.interaction,
            thread: data.thread,
            components: data.components,
            sticker_items: data.sticker_items,
            stickers: data.stickers
        });
    }
}