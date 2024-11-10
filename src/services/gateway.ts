import { WebSocket, type Data } from 'ws';
import type { Client } from "./client";
import type { Payload } from "../types/common";
import { exists, isNil, isObject, log } from "../utils";
import type { API } from "./api";
import type { Processor } from './processor';
import { Context } from '../types/context';
import { Message } from '../types/message';
import { User } from '../types/user';

export class Gateway {
    private socket: WebSocket | null = null;
    private heartbeat_interval: number | null = null;
    private heartbeat_timeout: Timer | null = null;
    private sequence: number | null = null;
    // Internal state
    private user: any;

    constructor(private client: Client, private processor: Processor, private api: API) {}

    private onOpen = () => {
        log('Connected to gateway');
    }

    private onMessage = (packet: Data) => {
        // console.log(packet);
        // Allocate a variable to store the parsed payload
        let data: Payload | null = null;

        try {
            // Attempt to parse the packet data
            data = JSON.parse(packet.toString());
        } catch (e) {
            console.error(e);
        }

        if (data) {
            log('='.repeat(25));
            log('received: ', data.op);
            log('received event: ', data.t ?? 'no event');
            log('received data: ', exists(data.d) ? Object.keys(data.d) : 'no data');
            log('='.repeat(25));
            // If the data is successfully parsed check the opcode
            const code = data.op;
            if (code === 0) {
                // Event received
                this.parseEvent(data);
            } else if (code === 1) {
                // Heartbeat requested
                this.send({ op: 1, d: this.sequence });
            } else if (code === 9) {
                // Reconnect requested
            } else if (code === 10) {
                // Hello
                if (!isObject(data.d)) {
                    throw new Error('Invalid HELLO payload received');
                }
                // Store the heartbeat interval
                this.heartbeat_interval = data.d?.heartbeat_interval;
                // Kick off the heartbeat loop
                this.heartbeat();
                setTimeout(this.indentify, 2500);
            } else if (code === 11) {
                // Heartbeat ACK
                log('Heartbeat ACK');
            }
        }
    }

    private heartbeat() {
        log('Sending heartbeat');
        if (exists(this.heartbeat_interval)) {
            // If a previous heartbeat timeout exists, clear it
            if (exists(this.heartbeat_timeout)) {
                clearTimeout(this.heartbeat_timeout);
            }
            // Set a timeout to ensure the heartbeat is sent within the interval
            this.heartbeat_timeout = setTimeout(() => {
                this.send({ op: 1, d: this.sequence });
                this.heartbeat();
            }, this.heartbeat_interval * Math.random());
        } else {
            throw new Error('Heartbeat interval not set');
        }
    }

    protected send = (payload: Partial<Payload>) => {
        if (isNil(this.socket)) {
            throw new Error('Socket is not connected');
        }

        log('='.repeat(25));
        log('sending: ', JSON.stringify(payload, null, 4));
        log('='.repeat(25));

        this.socket.send(JSON.stringify(payload));
    };

    private indentify = () => {
        this.send({
            op: 2,
            d: {
                token: this.client.token,
                intents: this.client.intents.reduce((acc, intent) => acc | intent, 0),
                properties: {
                    os: process.platform,
                    browser: 'discord.ts',
                    device: 'discord.ts'
                }
            }
        });
    };

    private parseEvent(payload: Payload) {
        if (isNil(payload.t)) {
            throw new Error('Event name is required');
        }

        log('Event:', payload.t);

        const event_name = payload.t;
        const event_data = payload.d;

        if (!isObject(event_data)) {
            throw new Error('Invalid event data received');
        }

        if (event_name === 'READY') {
            this.user = event_data.user;
            log('User:', this.user);
        } else if (event_name === 'INTERACTION_CREATE') {
            // this.handleInteractionCreate(payload);
        } else if (event_name === 'MESSAGE_CREATE') {
            this.handleMessageCreate(payload as Payload);
        } else if (event_name === 'MESSAGE_UPDATE') {
            // this.handleMessageCreate(payload);
        }

        // Allocate a var to store the context
        let context = null;

        if (['MESSAGE_CREATE', 'MESSAGE_UPDATE'].includes(event_name)) {
            // If the event is a message event, create a message object
            const message = Message.fromAPIResponse(event_data);
            // And then generate the context
            context = new Context(this.client, this.api, message);
        }

        // Call event handlers
        this.processor.events.execute(event_name, context, event_data);
    }

    private handleMessageCreate = async (payload: Payload) => {
        if (!isObject(payload.d)) {
            throw new Error('Invalid MESSAGE_CREATE payload received');
        }

        // Ignore bots
        if (payload.d.author.bot) {
            return;
        }
        // Ignore self
        if (payload.d.author.id === this.user.id) {
            return;
        }
        // Extract the author
        const author = User.fromAPIResponse(payload.d.author);
        // Store the author in the cache
        this.client.users.set(author.id, author);
        // Extract the content
        const content = payload.d.content.trim();
        // Is this a command?
        if (content.startsWith(this.client.prefix) || content.startsWith(`<@${this.user.id}>`)) {
            // Determine the prefix
            const prefix = content.startsWith(this.client.prefix) ? this.client.prefix : `<@${this.user.id}> `;
            // Parse command
            const args = content
                .slice(prefix.length)
                .trim()
                .split(/\s+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g);
            // Ignore empty commands
            if (args.length === 0) {
                return;
            }
            // Extract the command name
            // TODO: Case insensitive config?
            const command = args.shift()!;
            // Create a new message object from the payload
            const message = Message.fromAPIResponse(payload.d);
            // Generate context
            const context = new Context(this.client, this.api, message);
            // Check if command exists
            if (this.processor.commands.has(command)) {
                // Execute the handler
                this.processor.commands.execute(command, context, args);
            } else {
                // TODO: Custom unknown command handler
                context.reply(`Unknown command: ${command}`);
            }
        }
    };

    async connect() {
        // Fetch the Discord gateway URL
        const response = await this.api.request('GET', '/gateway/bot');
        // Append the query parameters to the URL
        const url = new URL(response.url);
        url.searchParams.append('v', '10');
        url.searchParams.append('encoding', 'json');
        // Open a new WebSocket connection to the Discord gateway
        this.socket = new WebSocket(url);
        // Register event listeners
        this.socket.on('open', this.onOpen);
        this.socket.on('message', this.onMessage);
    }
}