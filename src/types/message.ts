import { isNil } from '../utils';
import { Embed } from './embed';
import { User } from './user';

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
    public content?: string;
    public embeds: Embed[] = [];
    public components: Component[] = [];
    public message_reference?: {
        type?: number;
        message_id: string;
        channel_id: string;
        guild_id?: string;
        fail_if_not_exists?: boolean;
    };

    constructor(data?: Partial<Message>) {
        if (data) {
            this.id = data.id;
            this.author = User.fromAPIResponse(data.author);
            this.channel_id = data.channel_id;
            this.guild_id = data.guild_id;
            this.content = data.content;
            this.message_reference = data.message_reference;
        }
    }

    public static fromAPIResponse = (data: any) => {
        return new Message({
            id: data.id,
            author: data.author,
            channel_id: data.channel_id,
            guild_id: data.guild_id,
            content: data.content,
            message_reference: data.message_reference
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

    public setReference = (message: Partial<Message>) => {
        if (isNil(message.id) || isNil(message.channel_id)) {
            throw new Error('Message ID and Channel ID are required');
        }

        this.message_reference = {
            message_id: message.id,
            channel_id: message.channel_id,
            guild_id: message.guild_id,
            fail_if_not_exists: false
        };
        return this;
    };

    public toJSON = () => {
        return {
            content: this.content,
            embeds: this.embeds,
            components: this.components,
            message_reference: this.message_reference
        };
    };
}
