import { Client } from "..";
import { Context } from "../lib";

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
}

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
}

export abstract class SlashCommand {
    type: SlashCommandType;
    name: string;
    description: string;
    options: SlashCommandOption[];
    guild_id?: string;
    dm_permission?: boolean;
    default_member_permissions?: string;
    execute: SlashCommandFuntion;
}

export type SlashCommandFuntion = (client: Client, context: Context, ...args: any[]) => void;