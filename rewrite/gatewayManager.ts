import { WebSocket, type Data } from 'ws';
import { Unicord } from '.';
import { UnicordCommandContext } from './context';
import type { DiscordMessage, Payload, UnicordEventContext } from './types';
import { fromDiscord, Message, UnicordEventType, User } from './types';
import { exists, isNil, isObject, log } from './utils';

export class UnicordGatewayManager {
    private socket: WebSocket | null = null;
    private heartbeat_interval: number | null = null;
    private heartbeat_timeout: ReturnType<typeof setTimeout> | null = null;
    private sequence: number | null = null;
    private awaiting_heartbeat_ack = false;

    private session_id: string | null = null;
    private resume_gateway_url: string | null = null;
    private should_resume = false;
    private reconnecting = false;
    private reconnect_attempts = 0;

    // Internal state
    user: User | null = null;

    constructor(private readonly self: Unicord) {}

    private onOpen = () => {
        log('Connected to gateway');
        this.reconnecting = false;
        this.reconnect_attempts = 0;
    };

    private onClose = (code: number, reason: Buffer) => {
        log('Gateway closed:', code, reason.toString());
        this.clearHeartbeat();

        if (!this.reconnecting) {
            this.reconnect(this.canResumeFromCloseCode(code));
        }
    };

    private onError = (error: Error) => {
        log('Gateway error:', error);

        if (!this.reconnecting) {
            this.reconnect(true);
        }
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
            if (exists(data.s)) {
                this.sequence = data.s;
            }

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
                this.sendHeartbeat();
            } else if (code === 7) {
                // Reconnect requested
                this.reconnect(true);
            } else if (code === 9) {
                // Invalid session. Discord sends a boolean indicating whether resume is allowed.
                const canResume = data.d === true;
                if (!canResume) {
                    this.session_id = null;
                    this.sequence = null;
                    this.should_resume = false;
                }
                this.reconnect(canResume);
            } else if (code === 10) {
                // Hello
                if (!isObject(data.d)) {
                    throw new Error('Invalid HELLO payload received');
                }
                // Store the heartbeat interval
                this.heartbeat_interval = data.d?.heartbeat_interval;
                // Kick off the heartbeat loop with initial jitter
                this.startHeartbeat();
                // Resume or identify with the gateway
                if (this.should_resume && exists(this.session_id)) {
                    this.resume();
                } else {
                    this.identify();
                }
            } else if (code === 11) {
                // Heartbeat ACK
                this.awaiting_heartbeat_ack = false;
            }
        }
    };

    private startHeartbeat() {
        if (!exists(this.heartbeat_interval)) {
            throw new Error('Heartbeat interval not set');
        }

        this.clearHeartbeat();

        const firstHeartbeatDelay = this.heartbeat_interval * Math.random();
        this.heartbeat_timeout = setTimeout(() => {
            this.heartbeat();
        }, firstHeartbeatDelay);
    }

    private heartbeat() {
        if (!exists(this.heartbeat_interval)) {
            throw new Error('Heartbeat interval not set');
        }

        if (this.awaiting_heartbeat_ack) {
            log('Missed heartbeat ACK; reconnecting gateway');
            this.reconnect(true);
            return;
        }

        this.sendHeartbeat();

        this.heartbeat_timeout = setTimeout(() => {
            this.heartbeat();
        }, this.heartbeat_interval);
    }

    private sendHeartbeat() {
        this.awaiting_heartbeat_ack = true;
        this.send({ op: 1, d: this.sequence });
    }

    private clearHeartbeat() {
        if (exists(this.heartbeat_timeout)) {
            clearTimeout(this.heartbeat_timeout);
            this.heartbeat_timeout = null;
        }

        this.awaiting_heartbeat_ack = false;
    }

    protected send = (payload: Partial<Payload>) => {
        if (isNil(this.socket) || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error('Socket is not connected');
        }

        // log('='.repeat(25));
        // log('sending: ', JSON.stringify(payload, null, 4));
        // log('='.repeat(25));

        this.socket.send(JSON.stringify(payload));
    };

    private identify = () => {
        this.should_resume = false;
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

    private resume = () => {
        this.send({
            op: 6,
            d: {
                token: this.self.config.token,
                session_id: this.session_id,
                seq: this.sequence,
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
            this.session_id = event_data.session_id;
            this.resume_gateway_url = event_data.resume_gateway_url;
            this.should_resume = true;
        } else if (event_name === 'RESUMED') {
            this.should_resume = true;
        } else if (event_name === 'INTERACTION_CREATE') {
            // TODO: Application commands/interactions need a redesigned context/hydration model before implementation.
        } else if (event_name === 'MESSAGE_CREATE') {
            await this.handleMessageCreate(payload);
        } else if (event_name === 'MESSAGE_UPDATE') {
            // TODO: setting to call commands again here on message edit
            // await this.handleMessageUpdate(payload);
        }

        // TODO: Make a real UnicordEventContext class
        this.self.emitSystem(event_name, event_data as UnicordEventContext);
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
        if (typeof payload.d.content !== 'string') {
            return;
        }

        // Extract the content
        console.log('payload.d', payload.d);
        console.log('content', payload.d.content);
        const content = payload.d.content.trim();
        const hasPrefixInConfig = exists(this.self.config.prefix) && this.self.config.prefix.length > 0;
        const userMentionPrefix = `<@${this.user.id}>`;

        // Is this a command?
        if (
            (hasPrefixInConfig && content.startsWith(this.self.config.prefix!)) ||
            content.startsWith(userMentionPrefix)
        ) {
            // Determine the prefix
            const prefix =
                hasPrefixInConfig && content.startsWith(this.self.config.prefix!)
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
            this.self.emitCommand(UnicordEventType.ChatCommands, command, context, args);
        }
    };

    private reconnect(resume: boolean) {
        if (this.reconnecting) {
            return;
        }

        this.reconnecting = true;
        this.should_resume = resume && exists(this.session_id);
        this.clearHeartbeat();

        if (exists(this.socket)) {
            this.socket.removeAllListeners();
            this.socket.terminate();
            this.socket = null;
        }

        const delay = this.getReconnectDelay();
        log(`Reconnecting gateway in ${delay}ms${this.should_resume ? ' with resume' : ''}`);

        setTimeout(() => {
            const gatewayUrl =
                this.should_resume && exists(this.resume_gateway_url) ? this.resume_gateway_url : undefined;
            this.connect(gatewayUrl).catch((error) => {
                log('Gateway reconnect failed:', error);
                this.reconnecting = false;
                this.reconnect(this.should_resume);
            });
        }, delay);
    }

    private getReconnectDelay() {
        const baseDelay = 1_000;
        const maxDelay = 60_000;
        const delay = Math.min(maxDelay, baseDelay * 2 ** this.reconnect_attempts);
        this.reconnect_attempts += 1;
        return delay + Math.floor(Math.random() * 1_000);
    }

    private canResumeFromCloseCode(code: number) {
        // Discord documents these close codes as non-resumable.
        return ![4004, 4010, 4011, 4012, 4013, 4014].includes(code);
    }

    async connect(gatewayUrl?: string) {
        // Fetch the Discord gateway URL when no explicit URL was provided.
        const response = gatewayUrl
            ? { url: gatewayUrl }
            : await this.self.discordAPI.request<{ url: string }>('GET', '/gateway/bot');
        // Append the query parameters to the URL
        const url = new URL(response.url);
        url.searchParams.set('v', '10');
        url.searchParams.set('encoding', 'json');
        // Open a new WebSocket connection to the Discord gateway
        this.socket = new WebSocket(url);
        // Register event listeners
        this.socket.on('open', this.onOpen);
        this.socket.on('message', this.onMessage);
        this.socket.on('close', this.onClose);
        this.socket.on('error', this.onError);
    }
}
