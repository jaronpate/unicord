import { WebSocket, Data } from 'ws';
import axios, { AxiosInstance } from 'axios';
import { Client } from '..';
import {
    Session,
    User,
    Payload,
    Intent,
    Handler,
    HandlerFunction,
    Command,
    Status,
    Presence,
    ActivityType,
    CommandFuntion,
    Interaction,
    InteractionFunction
} from '../types';
import { Context } from './context';
import { InteractionContext } from './interaction';

export class Gateway {
    socket: WebSocket;
    axios: AxiosInstance;
    // Config
    readonly token: string;
    readonly client: Client;
    private intents: number = 513;
    private commandNotFound: CommandFuntion = null;
    // Discord gateway data
    private readonly url: string = 'wss://gateway.discord.gg/?v=10&encoding=json';
    private heartbeat_interval: number | null = null;
    private session: Session = null;
    public user: User = null;
    // Utils
    public event_handlers: Map<string, Array<Handler | HandlerFunction>> = new Map();
    public interaction_handlers: Map<string, Array<Interaction | InteractionFunction>> = new Map();

    constructor({
        token,
        intents,
        client,
        commandNotFound
    }: {
        token: string;
        intents?: Intent[];
        client: Client;
        commandNotFound?: CommandFuntion;
    }) {
        // Copy config
        this.token = token;
        this.client = client;
        this.commandNotFound = commandNotFound;
        // Initialize socket
        this.socket = new WebSocket(this.url);
        // Initialize axios
        this.axios = axios.create({
            headers: {
                'User-Agent': 'DiscordBot (discord.ts, 0.0.1)',
                Authorization: `Bot ${this.token}`
            },
            baseURL: 'https://discord.com/api/v10'
        });
        this.axios.interceptors.response.use((response) => response.data);
        // Calculate intents
        if (intents) {
            this.intents = intents.reduce((acc, intent) => acc | intent, 0);
        }
    }

    public connect = () => {
        // Initialize socket
        this.socket = new WebSocket(this.url);
        // Register the listeners
        this.socket.on('open', this.onOpen);
        this.socket.on('message', this.onMessage);
        // this.socket.on('close', this.onClose);
        // this.socket.on('error', this.onError);
        return this;
    };

    public reconnect = () => {
        return this.connect();
    };

    public setPresence = (presence: Presence) => {
        this.send({
            op: 3,
            d: presence
        });
    };

    public handlers = {
        register: (events: string | string[], handler: Handler | HandlerFunction) => {
            this.registerHandler(events, handler, 'command');
        },
        get: (event: string) => {
            return this.event_handlers.get(event);
        }
    };

    public interactions = {
        register: (custom_ids: string | string[], handler: Interaction | InteractionFunction) => {
            this.registerHandler(custom_ids, handler, 'interaction');
        },
        get: (event: string) => {
            return this.interaction_handlers.get(event);
        }
    };

    public api = {
        get: (url: string, params?: any) => {
            return this.axios.get<unknown, Record<string, any>>(url, { params });
        },
        post: (url: string, data?: any) => {
            return this.axios.post<unknown, Record<string, any>>(url, data);
        },
        patch: (url: string, data?: any) => {
            return this.axios.patch<unknown, Record<string, any>>(url, data);
        },
        delete: (url: string, data?: any) => {
            return this.axios.delete<unknown, Record<string, any>>(url, data);
        }
    };

    // prettier-ignore
    private registerHandler(events: string | string[], handler: Handler | HandlerFunction, type: 'command'): void;
    // prettier-ignore
    private registerHandler(events: string | string[], handler: Interaction | InteractionFunction, type: 'interaction'): void;

    private registerHandler(events: string | string[], handler: any, type: 'command' | 'interaction') {
        const handler_map = type === 'command' ? this.event_handlers : this.interaction_handlers;
        if (Array.isArray(events)) {
            // If Array register handler for each event
            for (const event of events) {
                const current_handlers = handler_map.get(event) ?? [];
                handler_map.set(event, [...current_handlers, handler]);
            }
        } else {
            // Otherwise register for the single event
            const current_handlers = handler_map.get(events) ?? [];
            handler_map.set(events, [...current_handlers, handler]);
        }
    }
    private send = (payload: Partial<Payload>) => {
        payload.s = this.session?.s ?? null;
        console.log('sending: %s', payload);
        this.socket.send(JSON.stringify(payload));
    };

    private indentify = () => {
        this.send({
            op: 2,
            d: {
                token: this.token,
                intents: this.intents,
                properties: {
                    os: process.platform,
                    browser: 'discord.ts',
                    device: 'discord.ts'
                }
            }
        });
    };

    private heartbeat = () => {
        if (!this.heartbeat_interval) {
            throw new Error('No heartbeat interval set');
        }
        setInterval(() => {
            this.send({
                op: 1,
                d: {}
            });
        }, this.heartbeat_interval);
    };

    private initialize = (payload: Payload) => {
        this.session = payload.d.session;
        this.user = payload.d.user;
        this.user.tag = `${this.user.username}#${this.user.discriminator}`;
        // Construct presence
        const status: Presence = {
            status: Status.Online,
            since: null,
            activities: [
                {
                    name: payload.d.guilds.length + ' servers',
                    type: ActivityType.Watching,
                    created_at: Date.now()
                }
            ],
            afk: false
        };
        // Set presence
        this.setPresence(status);
        // Cache guilds? (these are not whole guilds, just guild ids)
        // for (const guild of payload.d.guilds) {
        //     this.guilds.set(guild.id, guild);
        // }
        console.log('session: %s', this.session);
        console.log('user: %s', this.user);
    };

    private parseEvent = (payload: Payload) => {
        // If not a dispatch event, return
        if (!payload.t) {
            return;
        }
        // Run default handlers
        switch (payload.t) {
            case 'READY':
                this.initialize(payload);
                break;
            case 'INTERACTION_CREATE':
                this.handleInteractionCreate(payload);
                break;
            case 'MESSAGE_CREATE':
                this.handleMessageCreate(payload);
                break;
            case 'MESSAGE_UPDATE':
                this.handleMessageCreate(payload);
                break;
            default:
                break;
        }
        // Call event handlers
        const handlers = this.handlers.get(payload.t);
        const context = new Context({ client: this.client, message: payload.d });
        if (handlers) {
            for (const handler of handlers) {
                handler instanceof Handler
                    ? handler.execute(this.client, context, payload.d)
                    : handler(this.client, context, payload.d);
            }
        }
    };

    private handleInteractionCreate = (payload: Payload) => {
        if (payload.d.type === 2) {
            this.handleShashInteraction(payload);
        } else {
            this.handleChatInteraction(payload);
        }
    };

    private handleShashInteraction = (payload: Payload) => {};

    private handleChatInteraction = (payload: Payload) => {
        const context = new InteractionContext({ client: this.client, interaction: payload.d });
        const handlers = this.client.interactions.get(payload.d.data.custom_id);
        if (handlers) {
            for (const handler of handlers) {
                if (handler instanceof Interaction) {
                    handler.execute(this.client, context, payload.d);
                } else {
                    handler(this.client, context, payload.d);
                }
            }
        }
    };

    private handleMessageCreate = async (payload: Payload) => {
        // Ignore bots
        if (payload.d.author.bot) {
            return;
        }
        console.log(payload.d);
        // Is this a command?
        if (payload.d.content.startsWith(this.client.prefix)) {
            // Parse command
            const args = payload.d.content
                .slice(this.client.prefix.length)
                .trim()
                .split(/\s+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g);
            // Check if command exists
            const handler = this.client.commands.get(args[0]);
            // Generate context
            const context = new Context({ client: this.client, message: payload.d });
            if (handler) {
                // Execute command
                handler instanceof Command
                    ? handler.execute(this.client, context, args.slice(1))
                    : handler(this.client, context, args.slice(1));
            } else {
                let reply = null;
                // Send error message if command does not exist
                if (this.commandNotFound) {
                    // If custom command not found handler is set, use that
                    reply = this.commandNotFound(this.client, context);
                } else {
                    // Otherwise send default message
                    reply = await context.reply('Command not found :(', true);
                }
                if (reply) {
                    // If reply is set, delete it after 3 seconds
                    setTimeout(() => {
                        context.delete(reply.id);
                    }, 3000);
                }
            }
        }
    };

    private parseOpCode = (payload: Payload) => {
        switch (payload.op) {
            case 0:
                this.parseEvent(payload);
                break;
            case 9:
                setTimeout(this.reconnect, 500);
                break;
            case 10:
                this.heartbeat_interval = payload.d.heartbeat_interval;
                this.heartbeat();
                this.indentify();
                break;
            case 11:
                console.log('heartbeat acknowledged');
                break;
            default:
                break;
        }
    };

    private onMessage = (packet: Data): void => {
        let data: Payload | null = null;
        try {
            data = JSON.parse(packet.toString());
        } catch (e) {
            console.error(e);
        }
        if (data) {
            console.log('received: %s', data);
            console.log('received data: %s', data.d);
            if (this.session && data.s && data.s > this.session.s) {
                this.session.s = data.s;
            } else {
                this.parseOpCode(data);
            }
        }
    };

    private onOpen = () => {
        console.log('Socket open');
    };
}
