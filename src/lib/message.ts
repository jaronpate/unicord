export type Embed = {

}

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
}

export type Button = {
    style: ComponentStyle;
    label: string;
    emoji?: Emoji
    custom_id?: string;
    url?: string;
    disabled?: boolean;
}

export type SelectMenu = {
    custom_id: string;
    options: {
        label: string;
        value: string;
        description?: string;
        emoji?: Emoji
        default?: boolean;
    }[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
}

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
    TextInput
}

export class Message {
    id?: string;
    channel_id?: string;
    guild_id?: string;
    public content?: string;
    public embeds: Embed[] = [];
    public components: Component[] = [];
    public message_reference?: {
        message_id?: string;
        channel_id?: string;
        guild_id?: string;
        fail_if_not_exists?: boolean;
    }
    
    constructor() {}

    public static button(config: Button): Component {
        return {
            type: ComponentType.Button,
            ...config
        }
    }

    public static selectMenu(config: SelectMenu): Component {
        return {
            type: ComponentType.SelectMenu,
            ...config
        }
    }

    public setContent = (content: string) => {
        this.content = content;
        return this;
    }

    public addEmbed = (embed: Embed) => {
        this.embeds.push(embed);
        return this;
    }

    public addComponent = (content: Component | string, ...components: Component[]) => {
        if (typeof content === 'string') {
            console.log('string');
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
    }

    public setReference = (message: Partial<Message>) => {
        this.message_reference = {
            message_id: message.id,
            channel_id: message.channel_id,
            guild_id: message.guild_id,
            fail_if_not_exists: false
        }
        return this;
    }

    public toJSON = () => {
        return {
            content: this.content,
            embeds: this.embeds,
            components: this.components,
            message_reference: this.message_reference
        }
    }
}