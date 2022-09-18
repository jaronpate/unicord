import { Client } from "..";
import { Context } from "../lib";

export abstract class Command {
    abstract name: string;
    abstract description: string;
    abstract execute: CommandFuntion;
}

export type CommandFuntion = (client: Client, context: Context, ...args: any[]) => void;