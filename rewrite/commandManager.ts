import type {
    ArgumentTypeFromOptions,
    Unicord,
    UnicordArgumentDefinition,
    UnicordCommandOptions,
    UnicordEventContext,
    UnicordHandler,
} from '.';
import { UnicordCommandContext } from './context';
import type { UnicordEventProcessor } from './eventProcessor';
import { UnicordArgumentType, UnicordEventType } from './types/common';

type UnicordCommandDefinition<Options extends UnicordCommandOptions> = {
    options: Options;
    handler: UnicordHandler<Options>;
};

export const OptionConstructorMap = {
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
        [UnicordEventType.ChatCommands]: new Map<string, UnicordCommandDefinition<any>[]>(),
        [UnicordEventType.ApplicationCommands]: new Map<string, UnicordCommandDefinition<any>[]>(),
    };

    constructor(private readonly self: Unicord, private readonly eventProcessor: UnicordEventProcessor) {
        this.handlers = {
            [UnicordEventType.ChatCommands]: new Map(),
            [UnicordEventType.ApplicationCommands]: new Map(),
        };
    }

    private validateAndResolveArgs = async <const Options extends UnicordCommandOptions>(
        args: any[],
        definitions: Options['args'],
    ): Promise<ArgumentTypeFromOptions<Options['args']>> => {
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
    };

    register<const Options extends UnicordCommandOptions>(
        type: UnicordEventType.ChatCommands | UnicordEventType.ApplicationCommands,
        event: string,
        handler: UnicordHandler<Options>,
        options: Options = { args: [] } as unknown as Options,
    ) {
        if (this.handlers[type].has(event) === false) {
            this.handlers[type].set(event, []);
        }

        this.handlers[type].get(event)!.push({ options, handler });

        // Generate a closure to wrap the handler
        const wrappedHandler = async (context: UnicordCommandContext | UnicordEventContext, args: any[]) => {
            console.log('Raw Args:', args);
            console.log('options:', options.args);
            const resolvedArgs = await this.validateAndResolveArgs<Options>(args, options.args);
            console.log('Resolved Args:', resolvedArgs);
            // TODO: Fix context type here
            // @ts-expect-error will fix later
            return handler(context, resolvedArgs);
        };

        this.eventProcessor.register(`${type}:${event}`, wrappedHandler);
        return this.self;
    }

    registerChatCommand = this.register.bind(this, UnicordEventType.ChatCommands);
    registerApplicationCommand = this.register.bind(this, UnicordEventType.ApplicationCommands);
}
