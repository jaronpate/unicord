import { ComponentStyle, Context, Gateway, Guilds, Message, Embed } from './lib';
import { SlashCommand, SlashCommandFunction, ChatCommand, Command, CommandFunction, Intent, Presence } from './types';
export {
    ComponentStyle,
    Context,
    Gateway,
    Guilds,
    Message,
    Embed,
    Command,
    CommandFunction,
    ChatCommand,
    Intent,
    Presence
};

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
    private readonly client_commands: Map<string, ChatCommand | CommandFunction> = new Map();
    private readonly slash_commands: Map<string, SlashCommand | SlashCommandFunction> = new Map();
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
        chat: {
            register: (command: ChatCommand | string, handler?: CommandFunction) => {
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
                    command instanceof ChatCommand
                        ? command.execute(this, context, args.slice(1))
                        : command(this, context, args.slice(1));
                }
            },
            delete: (command_name: string) => {
                this.client_commands.delete(command_name);
            },
            list: () => {
                return Array.from(this.client_commands.entries());
            },
            map: () => {
                return this.client_commands;
            }
        },
        application: {
            register: (command: SlashCommand | Record<string, string>, handler?: SlashCommandFunction) => {
                const payload =
                    command instanceof SlashCommand
                        ? command.toJSON()
                        : {
                              name: command.name,
                              description: command.description,
                              type: command.type ?? 1
                          };
                this.api
                    .post(`/applications/${this.application_id}/commands`, payload)
                    .then((response) => {
                        console.log(response);
                        if (command instanceof SlashCommand) {
                            this.slash_commands.set(command.name, command);
                        } else {
                            this.slash_commands.set(command.name, handler);
                        }
                    })
                    .catch((error) => {
                        this.log.error('Error registering application command', error);
                    });
            },
            get: (command_name: string) => {
                return this.slash_commands.get(command_name);
            },
            list: () => {
                return Array.from(this.slash_commands.entries());
            },
            map: () => {
                return this.slash_commands;
            }
        }
    };

    private log = {
        error: (error_or_message: Error | string, error?: Error) => {
            if (error && typeof error_or_message === 'string') {
                console.error(`[discord.ts] ${error_or_message}:`, error);
            } else {
                console.error('[discord.ts] Error:', error_or_message);
            }
        }
    };

    private initialize = () => {
        // Register default help command
        this.commands.chat.register('help', (client, context, _args) => {
            const embed = new Embed()
                .setTitle('Commands')
                .setDescription('This is a list of commands you can use.')
                .setColor('#f6c221');

            const commands = client.commands.chat.list();

            for (const [name, command] of commands) {
                embed.addField({
                    name: name,
                    value: command instanceof ChatCommand ? command.description : 'No description provided'
                });
            }

            context.reply(embed.toMessage());
        });
    };
}
