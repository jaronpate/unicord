import { WebSocket, type Data } from 'ws';
import type { Client } from "../client";
import { fromDiscord, HandlerType, type Payload } from "../../types/common";
import { exists, isNil, isObject, log } from "../../utils";
import type { API } from "../api";
import type { Processor } from '../processor';
import { Context } from '../../types/context';
import { type DiscordMessage, Message } from '../../types/message';
import { DiscordUser, User } from '../../types/user';
import { Guild } from '../../types/guild';
import type { Emitter } from '../bus';
import type { InteractionCommandData, InteractionCommpoentData, InteractionPayload } from '../../types/handler';

export class Gateway {
    private socket: WebSocket | null = null;
    private heartbeat_interval: number | null = null;
    private heartbeat_timeout: Timer | null = null;
    private sequence: number | null = null;
    // Internal state
    user: User | null = null;

    constructor(private client: Client, private processor: Processor, private api: API, private bus: Emitter) {}

    private onOpen = () => {
        log('Connected to gateway');
    }

    private onMessage = async (packet: Data) => {
        // Allocate a variable to store the parsed payload
        let data: Payload | null = null;

        try {
            // Attempt to parse the packet data
            data = JSON.parse(packet.toString());
        } catch (e) {
            console.error(e);
        }

        if (exists(data)) {
            // NOTE: Uncomment for debugging recieved event data
            // log('='.repeat(25));
            // log('received: ', data.op);
            // log('received event: ', data.t ?? 'no event');
            // log('received data: ', exists(data.d) ? Object.keys(data.d) : 'no data');
            // log('='.repeat(25));
            // If the data is successfully parsed check the opcode
            const code = data.op;
            if (code === 0) {
                // Event received
                await this.parseEvent(data);
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
                // Identify with the gateway
                // TODO: Is there a way identify without the timeout? Or waiting for the heartbeat?
                // We need to wait a bit before sending the identify payload so that the heartbeat can be established
                setTimeout(this.indentify, 2500);
            } else if (code === 11) {
                // Heartbeat ACK
                log('Heartbeat ACK');
            }
        }
    }

    private heartbeat() {
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

        // log('='.repeat(25));
        // log('sending: ', JSON.stringify(payload, null, 4));
        // log('='.repeat(25));

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
                    browser: 'unicord',
                    device: 'unicord'
                }
            }
        });
    };

    private async parseEvent(payload: Payload) {
        if (isNil(payload.t)) {
            throw new Error('Event name is required');
        }

        log('Event:', payload.t);

        // Extract the event name and data
        const event_name = payload.t;
        const event_data = payload.d;

        // Simple validation on the event data
        if (!isObject(event_data)) {
            throw new Error('Invalid event data received');
        }

        // Check if this is a known event
        if (event_name === 'READY') {
            this.user = User[fromDiscord](DiscordUser.fromAPIResponse(event_data.user));
        } else if (event_name === 'INTERACTION_CREATE') {
            this.handleInteractionCreate(payload);
        } else if (event_name === 'MESSAGE_CREATE') {
            await this.handleMessageCreate(payload as Payload);
        } else if (event_name === 'MESSAGE_UPDATE') {
            // this.handleMessageCreate(payload);
        }

        // Allocate a var to store the context
        let context = null;

        // If the event is a message event, create a context from the message
        if (['MESSAGE_CREATE', 'MESSAGE_UPDATE'].includes(event_name)) {
            // If the event is a message event, create a message object
            const message = Message[fromDiscord](event_data as DiscordMessage);
            // And then generate the context
            context = new Context(this.client, this.api, { message });
        }

        // Call event handlers
        this.bus.emit(event_name, context, event_data);
        // this.processor.events.execute(event_name, context, event_data);
    }

    private handleMessageCreate = async (payload: Payload) => {
        if (isNil(this.user)) {
            throw new Error('Cannot handle MESSAGE_CREATE event without a user');
        }

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
        const author = User.fromDiscord(DiscordUser.fromAPIResponse(payload.d.author));
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
            const message = Message.fromDiscord(payload.d as DiscordMessage);
            // Store the message in the cache
            this.client.messages.set(message.id, message);
            // Generate context
            const context = new Context(this.client, this.api, { message });
            // Dispatch event for the command
            // this.bus.emit(`${HandlerType.ChatCommands}:${command}`, context, args);
            // // Check if command exists
            if (this.processor[HandlerType.ChatCommands].has(command)) {
                // Execute the handler
                this.processor[HandlerType.ChatCommands].execute(command, context, args);
            } else {
                // TODO: Custom unknown command handler
                // context.reply(`Unknown command: ${command}`);
            }
        }
    };

    private handleInteractionCreate = (payload: Payload) => {
        if (isNil(payload.d)) {
            throw new Error('Invalid INTERACTION_CREATE payload received');
        }

        if (!isObject(payload.d)) {
            throw new Error('Invalid INTERACTION_CREATE data received');
        }

        if (typeof payload.d.type !== 'number') {
            throw new Error('Invalid INTERACTION_CREATE type received');
        }

        if (payload.d.type === 2) {
            this.handleShashInteraction(payload as Payload & { d: InteractionPayload & { data: InteractionCommandData } });
        } else if (payload.d.type === 3) {
            this.handleChatInteraction(payload as Payload & { d: InteractionPayload & { data: InteractionCommpoentData } });
        } else {
            // this.handleChatInteraction(payload);
        }
    };

    private handleShashInteraction = (payload: Payload & { d: InteractionPayload & { data: InteractionCommandData } }) => {
        if (isNil(payload.d.data)) {
            throw new Error('Invalid INTERACTION_CREATE data received');
        }

        const command = payload.d.data.name;
        const args = payload.d.data.options ?? [];

        const context = new Context(this.client, this.api, { interaction: payload.d });

        if (payload.d.guild) {
            const guild = Guild.fromDiscord(payload.d.guild);
            this.client.guilds.set(guild.id, guild);
        }

        if (payload.d.member) {
            const member = User.fromDiscord(payload.d.member?.user);
            this.client.users.set(member.id, member);
        }

        if (payload.d.user) {
            const user = User.fromDiscord(payload.d.user);
            this.client.users.set(user.id, user);
        }

        // TODO: Fix when channel class is implemented
        // if (payload.d.data.channel) {
        //     const channel = Channel[fromDiscord](payload.d.data.channel);
        //     this.client.channels.set(channel.id, channel);
        // }

        if (this.processor.application_commands.has(command)) {
            this.processor.application_commands.execute(command, context, args?.map(arg => arg.value));
        } else {
            // TODO: Custom unknown command handler
            context.reply(`Unknown command: ${command}`);
        }
    };

    private handleChatInteraction = (payload: Payload & { d: InteractionPayload & { data: InteractionCommpoentData } }) => {
        const context = new Context(this.client, this.api, { interaction: payload.d });

        if (exists(payload.d.data)) {
            if (this.processor[HandlerType.Interactions].has(payload.d.data.custom_id)) {
                this.processor[HandlerType.Interactions].execute(payload.d.data.custom_id, context, payload.d.data);
            } else {
                context.reply(`Unknown interaction: \`${payload.d.data.custom_id}\``);
            }
        } else {
            context.reply('Invalid interaction data received');
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