import { Client } from '..';
import { InteractionContext } from '../lib';

enum SlashCommandType {
    ChatInput = 1,
    User,
    Message
}

enum SlashCommandOptionType {
    SubCommand = 1,
    SubCommandGroup,
    String,
    Integer,
    Boolean,
    User,
    Channel,
    Role,
    Mentionable,
    Number,
    ATTACHMENT
}

type SlashCommandOptionChoice = {
    name: string;
    value: string | number;
};

type SlashCommandOption = {
    type: SlashCommandOptionType;
    name: string;
    description: string;
    required?: boolean;
    choices?: SlashCommandOptionChoice[];
    options?: SlashCommandOption[];
    min_value?: number;
    max_value?: number;
    min_length?: number;
    max_length?: number;
    autocomplete?: boolean;
    // channel_types?: number[];
};

export class SlashCommand {
    type: SlashCommandType;
    name: string;
    description: string;
    options: SlashCommandOption[];
    guild_id?: string;
    dm_permission?: boolean;
    default_member_permissions?: string;
    execute: SlashCommandFunction;

    constructor(data: SlashCommand) {
        this.type = data.type;
        this.name = data.name;
        this.description = data.description;
        this.options = data.options;
        this.guild_id = data.guild_id;
        this.dm_permission = data.dm_permission;
        this.default_member_permissions = data.default_member_permissions;
        this.execute = data.execute;
    }

    public toJSON() {
        return {
            type: this.type,
            name: this.name,
            description: this.description,
            options: this.options,
            guild_id: this.guild_id,
            dm_permission: this.dm_permission,
            default_member_permissions: this.default_member_permissions
        };
    }
}

export type SlashCommandFunction = (client: Client, context: InteractionContext, ...args: any[]) => void;
