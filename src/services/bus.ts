import { EventEmitter } from 'node:events';
import type { Context } from '../types/context';

const EventBus = new EventEmitter() as Emitter;

export class Emitter extends EventEmitter {
    emit(event_name: string, context: Context | null, ...args: any[]): boolean {
        return super.emit(event_name, context, ...args);
    }
    on(event_name: string, listener: (context: Context | null, ...args: any[]) => void): this {
        return super.on(event_name, listener);
    }
}

export { EventBus };