import type {
    ArgumentTypeFromOptions,
    Unicord,
    UnicordArgumentDefinition,
    UnicordCommandHandler,
    UnicordCommandOptions,
} from '.';
import { UnicordCommandContext } from './context';
import type { UnicordEventProcessor } from './eventProcessor';
import { Embed } from './types';
import { UnicordArgumentType, UnicordEventType } from './types/common';

type UnicordCommandDefinition<Options extends UnicordCommandOptions> = {
    options: Options;
    handler: UnicordCommandHandler<Options>;
};

export const ArgumentConstructorMap = {
    [UnicordArgumentType.String]: String,
    [UnicordArgumentType.Integer]: Number,
    [UnicordArgumentType.Boolean]: Boolean,
    [UnicordArgumentType.Number]: Number,
    [UnicordArgumentType.User]: String, // Could be a user ID or object depending on your use case
    [UnicordArgumentType.Channel]: String, // Could be a channel ID or object
    [UnicordArgumentType.Role]: String, // Could be a role ID or object
    [UnicordArgumentType.Mentionable]: String, // Could be a mentionable ID or object
    [UnicordArgumentType.Attachment]: String, // Could represent attachment IDs
    [UnicordArgumentType.SubCommand]: String, // Handled by `options`
    [UnicordArgumentType.SubCommandGroup]: String, // Handled by `options`
};

export class UnicordCommandManager {
    private handlers = {
        [UnicordEventType.ChatCommands]: new Map<
            string,
            UnicordCommandDefinition<any> & { wrappedHandler: UnicordCommandHandler<any> }
        >(),
        [UnicordEventType.ApplicationCommands]: new Map<
            string,
            UnicordCommandDefinition<any> & { wrappedHandler: UnicordCommandHandler<any> }
        >(),
    };

    constructor(private readonly self: Unicord, private readonly eventProcessor: UnicordEventProcessor) {
        this.handlers = {
            [UnicordEventType.ChatCommands]: new Map(),
            [UnicordEventType.ApplicationCommands]: new Map(),
        };

        this.registerDefaultHelpCommand();
    }

    private async validateAndResolveArgs<const Options extends UnicordCommandOptions>(
        args: any[],
        definitions: Options['args'],
    ): Promise<ArgumentTypeFromOptions<Options['args']>> {
        const validated: Record<string, any> = {};

        if (args.length > definitions.length) {
            throw new Error(`Too many arguments. Expected ${definitions.length}, received ${args.length}`);
        }

        for (const [index, def] of definitions.entries()) {
            const arg = args[index];

            if (arg === undefined || arg === null || arg === '') {
                if (def.required) {
                    throw new Error(`Missing required argument: ${def.name}`);
                }
                validated[def.name] = undefined;
                continue;
            }

            validated[def.name] = this.coerceArgument(def, arg);
        }

        return Promise.resolve(validated as ArgumentTypeFromOptions<Options['args']>);
    }

    private coerceArgument(def: UnicordArgumentDefinition, value: any) {
        let coerced = value;

        if (def.type === UnicordArgumentType.Integer) {
            coerced = typeof value === 'number' ? value : parseInt(value, 10);
            if (!Number.isInteger(coerced)) {
                throw new Error(`Argument ${def.name} must be an integer`);
            }
        } else if (def.type === UnicordArgumentType.Number) {
            coerced = typeof value === 'number' ? value : Number(value);
            if (Number.isNaN(coerced)) {
                throw new Error(`Argument ${def.name} must be a number`);
            }
        } else if (def.type === UnicordArgumentType.Boolean) {
            if (typeof value === 'boolean') {
                coerced = value;
            } else if (value === 'true') {
                coerced = true;
            } else if (value === 'false') {
                coerced = false;
            } else {
                throw new Error(`Argument ${def.name} must be a boolean`);
            }
        }

        if (def.choices && !def.choices.some((choice) => choice.value === coerced)) {
            throw new Error(`Invalid choice for argument ${def.name}: ${value}`);
        }

        return coerced;
    }

    registerDefaultHelpCommand() {
        this.registerChatCommand(
            'help',
            async (context) => {
                // Just list chat commands for now
                const reply = new Embed().setTitle('Available Commands');

                for (const [command, def] of this.handlers[UnicordEventType.ChatCommands]) {
                    let fieldValue = def.options.description ?? 'No description';
                    fieldValue += '\n';

                    if (def.options.args.length > 0) {
                        fieldValue += `\n\`${command}`;
                        for (const arg of def.options.args) {
                            fieldValue += arg.required ? ` <${arg.name}>` : ` <?${arg.name}>`;
                        }
                        fieldValue += '`\n';
                        for (const arg of def.options.args) {
                            fieldValue += `- \`${arg.name}\` (${UnicordArgumentType[arg.type]}${
                                arg.required ? ', required' : ''
                            }): ${arg.description ?? 'No description'}\n`;
                        }
                    }

                    fieldValue += '\n';

                    reply.fields.push({
                        name: command,
                        value: fieldValue,
                    });
                }

                await context.reply(reply.toMessage());
            },
            {
                description: 'Lists all available commands',
                args: [],
            },
        );
    }

    all() {
        return this.handlers;
    }

    has(type: UnicordEventType.ChatCommands | UnicordEventType.ApplicationCommands, event: string) {
        return this.handlers[type].has(event);
    }

    merge(other: UnicordCommandManager) {
        const handlers = other.all();

        for (const type in handlers) {
            const typeKey = type as UnicordEventType.ChatCommands | UnicordEventType.ApplicationCommands;
            for (const [event, definition] of handlers[typeKey]) {
                this.register(typeKey, event, definition.handler, definition.options);
            }
        }

        this.registerDefaultHelpCommand();
    }

    unregister(type: UnicordEventType.ChatCommands | UnicordEventType.ApplicationCommands, event: string) {
        const handler = this.handlers[type].get(event);
        if (handler) {
            this.eventProcessor.unregister(`${type}:${event}`, handler.wrappedHandler);
            this.handlers[type].delete(event);
        }
        return this.self;
    }

    register<const Options extends UnicordCommandOptions>(
        type: UnicordEventType.ChatCommands | UnicordEventType.ApplicationCommands,
        event: string,
        handler: UnicordCommandHandler<Options>,
        options: Options = { args: [] } as unknown as Options,
    ) {
        if (type === UnicordEventType.ApplicationCommands) {
            const commandNameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;
            if (!commandNameRegex.test(event)) {
                throw new Error(
                    `${event} is not a valid application command name (1-32 characters, only letters, numbers, hyphens, and underscores)`,
                );
            }

            if (!options.description || options.description.length === 0) {
                throw new Error('Application commands require a description');
            }

            if (options.args && options.args.length > 25) {
                throw new Error('Application commands cannot have more than 25 arguments');
            }

            for (const arg of options.args) {
                if (arg.choices && arg.choices.length > 25) {
                    throw new Error(`Application command argument ${arg.name} cannot have more than 25 choices`);
                }
            }
        }

        if (this.has(type, event)) {
            this.unregister(type, event);
        }

        const wrappedHandler = (async (context: UnicordCommandContext, args: any[]) => {
            const resolvedArgs = await this.validateAndResolveArgs<Options>(args, options.args);
            return handler(context, resolvedArgs);
        }) as UnicordCommandHandler<Options>;

        this.handlers[type].set(event, { options, handler, wrappedHandler });

        this.eventProcessor.register(`${type}:${event}`, wrappedHandler);

        return this.self;
    }

    registerChatCommand = this.register.bind(this, UnicordEventType.ChatCommands);
    registerApplicationCommand = this.register.bind(this, UnicordEventType.ApplicationCommands);
}
