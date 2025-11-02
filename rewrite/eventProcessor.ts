import { EventEmitter } from 'node:events';
import type { Unicord } from '.';
import type { UnicordCommandContext } from './context';
import type { UnicordCommandOptions, UnicordEventContext, UnicordHandler } from './types/common';

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

    emit(event: string, context: UnicordCommandContext | UnicordEventContext, args: any[]): boolean {
        return super.emit(event, context, args);
    }
}
