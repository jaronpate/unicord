import { WebSocket, type Data } from 'ws';
import { Unicord } from '.';
import { UnicordCommandContext } from './context';
import type { DiscordMessage, Payload } from './types';
import { fromDiscord, Message, UnicordEventContext, UnicordEventType, User } from './types';
import { exists, isNil, isObject, log } from './utils';

export class UnicordGatewayManager {
    private socket: WebSocket | null = null;
    private heartbeat_interval: number | null = null;
    private heartbeat_timeout: Timer | null = null;
    private sequence: number | null = null;

    // Internal state
    user: User | null = null;

    constructor(private readonly self: Unicord) {}

    private onOpen = () => {
        log('Connected to gateway');
    };

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
                this.indentify();
            } else if (code === 11) {
                // Heartbeat ACK
                log('Heartbeat ACK');
            }
        }
    };

    private heartbeat() {
        if (exists(this.heartbeat_interval)) {
            // If a previous heartbeat timeout exists, clear it
            if (exists(this.heartbeat_timeout)) {
                clearTimeout(this.heartbeat_timeout);
            }
            // Send the heartbeat payload
            this.send({ op: 1, d: this.sequence });
            // Set a timeout to ensure the heartbeat is sent within the interval
            this.heartbeat_timeout = setTimeout(() => {
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
                token: this.self.config.token,
                intents: this.self.config.intents.reduce((acc, intent) => acc | intent, 0),
                properties: {
                    os: process.platform,
                    browser: 'unicord',
                    device: 'unicord',
                },
            },
        });
    };

    private async parseEvent(payload: Payload) {
        if (isNil(payload.t)) {
            throw new Error('Event name is required');
        }

        // log('Event:', payload.t);

        // Extract the event name and data
        const event_name = payload.t;
        const event_data = payload.d;

        // Simple validation on the event data
        if (!isObject(event_data)) {
            throw new Error('Invalid event data received');
        }

        if (event_name === 'READY') {
            this.user = User[fromDiscord](event_data.user);
        } else if (event_name === 'INTERACTION_CREATE') {
            // await this.handleInteractionCreate(payload);
        } else if (event_name === 'MESSAGE_CREATE') {
            await this.handleMessageCreate(payload);
        } else if (event_name === 'MESSAGE_UPDATE') {
            // TODO: setting to call commands again here on message edit
            // await this.handleMessageUpdate(payload);
        }

        // TODO: Make a real UnicordEventContext class
        this.self.emit(UnicordEventType.SystemEvent, event_name, event_data as UnicordEventContext, []);
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
        // Extract the content
        const content = payload.d.content.trim();
        const hasPrefixInConfig = exists(this.self.config.prefix) && this.self.config.prefix.length > 0;
        const userMentionPrefix = `<@${this.user.id}>`;
        // Is this a command?
        if (
            (hasPrefixInConfig && content.startsWith(this.self.config.prefix)) ||
            content.startsWith(userMentionPrefix)
        ) {
            // Determine the prefix
            const prefix =
                hasPrefixInConfig && content.startsWith(this.self.config.prefix)
                    ? this.self.config.prefix!
                    : userMentionPrefix;
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
            // Generate context
            const message = Message.fromDiscord(payload.d as DiscordMessage);
            const context: UnicordCommandContext = new UnicordCommandContext(this.self, { message });
            // Dispatch event for the command
            this.self.emit(UnicordEventType.ChatCommands, command, context, args);
        }
    };

    async connect() {
        // Fetch the Discord gateway URL
        const response = await this.self.discordAPI.request('GET', '/gateway/bot');
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
