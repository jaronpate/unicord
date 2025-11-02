import type {
    ArgumentTypeFromOptions,
    Unicord,
    UnicordArgumentDefinition,
    UnicordCommandHandler,
    UnicordCommandOptions,
    UnicordHandler,
} from '.';
import { UnicordCommandContext } from './context';
import type { UnicordEventProcessor } from './eventProcessor';
import { Embed } from './types';
import { UnicordArgumentType, UnicordEventType } from './types/common';
import { log } from './utils';

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
        // Zip the args and definition together
        const zipped: [UnicordArgumentDefinition, any][] = args.map((arg, i) => [definitions[i], arg]);
        // Validate the args
        const validated: Record<string, any> = {};
        // TODO: Attempt some type coresion/resolution here (mostly for text commands)
        for (const [def, arg] of zipped) {
            if (false) {
            } else {
                validated[def.name] = arg;
            }
        }
        // TODO: Fix types so we don't need to cast here
        return Promise.resolve(validated as ArgumentTypeFromOptions<Options['args']>);
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

    // TODO: Register application commands with the DiscordAPI
    register<const Options extends UnicordCommandOptions>(
        type: UnicordEventType.ChatCommands | UnicordEventType.ApplicationCommands,
        event: string,
        handler: UnicordCommandHandler<Options>,
        options: Options = { args: [] } as unknown as Options,
    ) {
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
