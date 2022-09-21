import { ComponentStyle, Context, Gateway, Guilds, Message, Embed } from './lib';
import { Command, CommandFuntion, Intent, Presence } from './types';
export { ComponentStyle, Context, Gateway, Guilds, Message, Embed, Command, CommandFuntion, Intent, Presence };

type Config = {
    token: string;
    application_id: string;
    prefix?: string;
    intents?: Intent[];
};

export class Client {
    readonly prefix: string;
    readonly token: string;
    readonly application_id: string;
    private readonly gateway: Gateway;
    private readonly client_commands: Map<string, Command | CommandFuntion> = new Map();
    private readonly slash_commands: Map<string, Command | CommandFuntion> = new Map();
    readonly guilds: Guilds;

    constructor({ token, application_id, prefix, intents }: Config) {
        this.token = token;
        this.application_id = application_id;
        this.prefix = prefix ?? '!';
        this.gateway = new Gateway({ token, intents, client: this });
        this.guilds = new Guilds({ token, gateway: this.gateway });
        // Do some default stuff
        this.initialize();
    }

    get user() {
        return this.gateway.user;
    }

    get handlers() {
        return this.gateway.handlers;
    }

    get interactions() {
        return this.gateway.interactions;
    }

    get api() {
        return this.gateway.api;
    }

    public connect = () => {
        this.gateway.connect();
        return this;
    };

    public reconnect = () => {
        this.gateway.reconnect();
        return this;
    };

    public setPresence = (presence: Presence) => {
        this.gateway.setPresence(presence);
        return this;
    };

    send = (channel_id: string, message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }
        return this.api.post(`/channels/${channel_id}/messages`, message);
    };

    public commands = {
        register: (command: Command | string, handler: CommandFuntion) => {
            if (typeof command === 'string') {
                this.client_commands.set(command, handler);
            } else {
                this.client_commands.set(command.name, command);
            }
        },
        get: (command_name: string) => {
            return this.client_commands.get(command_name);
        },
        execute: (command_name: string, context: Context, ...args: any[]) => {
            const command = this.client_commands.get(command_name);
            if (command) {
                command instanceof Command
                    ? command.execute(this, context, args.slice(1))
                    : command(this, context, args.slice(1));
            }
        },
        delete: (command_name: string) => {
            this.client_commands.delete(command_name);
        },
        list: () => {
            return this.client_commands;
        }
    };

    private initialize = () => {
        // Register default help command
        this.commands.register('help', (client, context, _args) => {
            const embed = new Embed().setTitle('Commands').setDescription('This is a list of commands you can use.');

            const commands = Array.from(client.commands.list().entries());

            for (const [name, command] of commands) {
                embed.addField({
                    name: name,
                    value: command instanceof Command ? command.description : 'No description provided'
                });
            }

            context.reply(embed.toMessage());
        });
    }

}
