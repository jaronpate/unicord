import { EventEmitter } from 'node:events';
import type { Unicord } from '.';
import type { UnicordCommandContext } from './context';
import type { UnicordCommandOptions, UnicordEventHandler, UnicordHandler } from './types/common';
import { UnicordEventType } from './types/common';

export class UnicordEventProcessor extends EventEmitter {
    constructor(private readonly self: Unicord) {
        super();
    }

    register<const Options extends UnicordCommandOptions>(event: string, handler: UnicordHandler<Options>) {
        return super.on(event, handler);
    }

    unregister<const Options extends UnicordCommandOptions>(event: string, handler: UnicordHandler<Options>) {
        return super.off(event, handler);
    }

    emitCommand(
        type: UnicordEventType.ChatCommands | UnicordEventType.ApplicationCommands,
        event: string,
        context: UnicordCommandContext,
        args: any[],
    ): boolean {
        return super.emit(`${type}:${event}`, context, args);
    }

    emitSystem(event: string, payload: Parameters<UnicordEventHandler>[0]): boolean {
        return super.emit(`${UnicordEventType.SystemEvent}:${event}`, payload);
    }
}
