import { Client } from '..';
import { Context } from '../lib';

export abstract class Command {
    readonly name: string;
    readonly description: string;
    readonly execute: CommandFunction;
    constructor(data: Command) {
        this.name = data.name;
        this.description = data.description;
        this.execute = data.execute;
    }
}

export type CommandFunction = (client: Client, context: Context, ...args: any[]) => void;

export class ChatCommand extends Command {
    constructor(data: ChatCommand) {
        super(data);
    }
}
