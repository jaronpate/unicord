import { Expectation, HandlerType, Intent, type ClientConfig } from '../types/common';
import { Message, type DiscordMessage } from '../types/message';
import { exists, isNil } from '../utils/index';
import { API } from './api';
import { EventBus, type Emitter } from './bus';
import { Channels } from './caches/channels';
import { Guilds } from './caches/guilds';
import { Messages } from './caches/messages';
import { Users } from './caches/users';
import { Gateway } from './connectors/gateway';
import { hydrate, hydrator, type Hydrateable, type Hydrated } from './hydrator';
import { Processor } from './processor';

export class Client {
    readonly token: string;
    readonly application_id: string;
    readonly intents: Intent[] = [Intent.DEFAULT];
    prefix: string;
    // Internal services
    protected bus: Emitter;
    protected api: API;
    protected processor: Processor;
    protected gateway: Gateway;
    guilds: Guilds;
    users: Users;
    messages: Messages;
    channels: Channels;
    chatCommands: Processor[HandlerType.ChatCommands];
    applicationCommands: Processor[HandlerType.ApplicationCommands];
    interactions: Processor[HandlerType.Interactions];

    constructor(config: ClientConfig) {
        // Validate the configuration
        Client.validateConfig(config);
        // Save the configuration
        this.token = config.token;
        this.application_id = config.application_id;
        this.intents = config.intents ?? this.intents;
        this.prefix = config.prefix ?? '!';
        // Initialize internal services
        this.bus = EventBus;
        this.api = new API(this);
        this.processor = new Processor(this, this.api, this.bus);
        this.gateway = new Gateway(this, this.processor, this.api, this.bus);
        this.guilds = new Guilds(this.api, this.processor);
        this.users = new Users(this.api, this.processor);
        this.messages = new Messages(this.api, this.processor);
        this.channels = new Channels(this.api, this.processor);
        // Save references to command and event handlers
        this.chatCommands = this.processor[HandlerType.ChatCommands];
        this.applicationCommands = this.processor[HandlerType.ApplicationCommands];
        this.interactions = this.processor[HandlerType.Interactions];
    }

    private static validateConfig(config: ClientConfig) {
        if (isNil(config.token)) {
            throw new Error('Token is required');
        }

        if (isNil(config.application_id)) {
            throw new Error('Application ID is required');
        }

        if (exists(config.prefix) && typeof config.prefix !== 'string') {
            throw new Error('Prefix must be a string');
        }

        if (exists(config.intents)) {
            if (!Array.isArray(config.intents)) {
                throw new Error('Intents must be an array');
            }

            for (const intent of config.intents) {
                if (!Intent[intent]) {
                    throw new Error(`Invalid intent: ${intent}`);
                }
            }
        }
    }

    get self() {
        return this.gateway.user;
    }

    /**
     * Hydrates a given data object based on the provided expectations.
     * 
     * @template T - The type of the data object to be hydrated. Must extend `Hydrateable`.
     * @template K - An array of `Expectation` types that specify what properties should be hydrated.
     * 
     * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
     * @param expectations - An array of expectations that specify what properties should be hydrated.
     * 
     * @returns A promise that resolves to the hydrated data object.
     * 
     * @throws Will throw an error if an expectation cannot be resolved.
     */
    hydrate = async <T extends Hydrateable | Hydrated<Hydrateable, Array<Expectation>>, K extends Array<Expectation>>(data: T, expectations: K) => {
        return hydrate<T, K>(data, expectations, this, this.api);
    }
    
    /**
     * A wrapper function that attempts to hydrate a given data object and returns a type guard function.
     * 
     * @template T - The type of the data object to be hydrated. Must extend `Hydrateable`.
     * @template K - An array of `Expectation` types that specify what properties should be hydrated.
     * 
     * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
     * @param expectations - An array of expectations that specify what properties should be hydrated.
     * 
     * @returns A promise that resolves to a type guard function. The type guard function returns `true` if the data object was successfully hydrated, otherwise `false`.
     */
    hydrator = async<T extends Hydrateable, K extends Expectation[]>(data: T, expectations: K) => {
        return hydrator<T, K>(data, expectations, this, this.api);   
    }

    sendMessage = async (channel_id: string, message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }

        return Message.fromDiscord(await this.api.post<DiscordMessage>(`/channels/${channel_id}/messages`, message.toJSON()));
    }

    // chatCommands = {
    //     register: (name: string | string[], handler: Handler) => this.processor.chat_commands.register(name, handler),
    //     unregister: (name: string | string[]) => this.processor.chat_commands.unregister(name),
    //     has: (name: string) => this.processor.chat_commands.has(name)
    // }

    // applicationCommands = {
    //     register: (name: string, type: ApplicationCommandType, handler: Handler) => this.processor.application_commands.register(name, type, handler),
    //     unregister: (name: string) => this.processor.application_commands.unregister(name),
    //     has: (name: string) => this.processor.application_commands.has(name)
    // }

    on = (event: string, handler: (...args: any[]) => void) => this.bus.on(event, handler);

    once = (event: string, handler: (...args: any[]) => void) => this.bus.once(event, handler);

    off = (event: string, handler: (...args: any[]) => void) => this.bus.off(event, handler);

    connect = () => this.gateway.connect();
}
