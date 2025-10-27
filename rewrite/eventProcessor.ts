import { EventEmitter } from 'node:events';
import type { Unicord } from '.';
import type {
    UnicordCommandHandler,
    UnicordCommandOptions,
    UnicordEventContext,
    ArgumentTypeFromOptions,
    UnicordArgumentDefinition,
    UnicordHandler,
} from './types/common';
import { UnicordArgumentType } from './types/common';
import type { UnicordCommandContext } from './context';

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

export class UnicordEventProcessor extends EventEmitter {
    constructor(private readonly self: Unicord) {
        super();
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
        event: string,
        handler: UnicordHandler<Options>,
        options: Options,
    ) {
        // Generate a closure to wrap the handler
        const wrappedHandler = async (context: UnicordCommandContext | UnicordEventContext, args: any[]) => {
            const resolvedArgs = await this.validateAndResolveArgs<Options>(args, options.args);
            // TODO: Fix context type here
            // @ts-expect-error will fix later
            return handler(context, resolvedArgs);
        };
        return super.on(event, wrappedHandler);
    }

    emit(event: string, context: UnicordCommandContext | UnicordEventContext, args: any[]): boolean {
        return super.emit(event, context, args);
    }
}
