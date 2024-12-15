import { EventEmitter } from 'node:events';
import type { Context } from '../types/context';

const EventBus = new EventEmitter() as Emitter;

export type Emitter = EventEmitter & {
    emit: (event_name: string, context: Context | null, ...args: any[]) => boolean
}

export { EventBus };