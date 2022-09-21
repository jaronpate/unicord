import { Client } from "..";
import { Context } from "../lib";

export abstract class Command {
    name: string;
    description: string;
    execute: CommandFuntion;
}

export type CommandFuntion = (client: Client, context: Context, ...args: any[]) => void;