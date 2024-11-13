import { API } from './api';
import { Gateway } from './gateway';
import { Processor } from './processor';
import { Expectation, Intent, type ClientConfig } from '../types/common';
import { exists, isNil } from '../utils/index';
import type { Handler } from '../types/hander';
import { DiscordMessage, Message } from '../types/message';
import { Guilds } from './guilds';
import { Users } from './users';
import { Messages } from './messages';
import { hydrator, type Hydrateable } from './hydrator';

export class Client {
    readonly token: string;
    readonly application_id: string;
    readonly intents: Intent[] = [Intent.DEFAULT];
    prefix: string;
    // Internal services
    protected api: API;
    protected processor: Processor;
    protected gateway: Gateway;
    guilds: Guilds;
    users: Users;
    messages: Messages

    constructor(config: ClientConfig) {
        // Validate the configuration
        Client.validateConfig(config);
        // Save the configuration
        this.token = config.token;
        this.application_id = config.application_id;
        this.intents = config.intents ?? this.intents;
        this.prefix = config.prefix ?? '!';
        // Initialize internal services
        this.api = new API(this);
        this.processor = new Processor(this, this.api);
        this.gateway = new Gateway(this, this.processor, this.api);
        this.guilds = new Guilds(this.api, this.processor);
        this.users = new Users(this.api, this.processor);
        this.messages = new Messages(this, this.api, this.processor);
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

    hydrator = async<T extends Hydrateable, K extends Expectation[]>(data: T, expectations: K) => {
        return hydrator<T, K>(data, expectations, this, this.api);   
    }

    sendMessage = async (channel_id: string, message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }

        return Message.fromDiscord(DiscordMessage.fromAPIResponse(await this.api.post(`/channels/${channel_id}/messages`, message.toJSON())));
    }

    chatCommands = {
        register: (name: string | string[], handler: Handler) => this.processor.chat_commands.register(name, handler),
        unregister: (name: string | string[]) => this.processor.chat_commands.unregister(name),
        has: (name: string) => this.processor.chat_commands.has(name)
    }

    slashCommands = {
        register: (name: string, handler: Handler) => this.processor.slash_commands.register(name, handler),
        unregister: (name: string) => this.processor.slash_commands.unregister(name),
        has: (name: string) => this.processor.slash_commands.has(name)
    }

    connect = () => this.gateway.connect();
}