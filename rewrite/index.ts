import { UnicordChannelsCache, UnicordGuildsCache, UnicordUsersCache } from './caches';
import type { UnicordCommandContext } from './context';
import { UnicordDiscordAPI } from './discordAPI';
import { UnicordEventProcessor } from './eventProcessor';
import { UnicordGatewayManager } from './gatewayManager';
import { hydrate } from './hydrator';
import type {
    UnicordCommandHandler,
    UnicordCommandOptions,
    UnicordConfig,
    UnicordConfigWithDefaults,
    UnicordEventContext,
    UnicordEventHandler,
    UnicordHandler,
} from './types/common';
import { Intent, UnicordEventType } from './types/common';
import type { DiscordMessage } from './types/message';
import { Message } from './types/message';
import { defaults } from './utils';

const UNICORD_CONFIG_DEFAULTS = {
    intents: [Intent.DEFAULT],
};

export class Unicord {
    readonly config: UnicordConfigWithDefaults;
    readonly discordAPI: UnicordDiscordAPI;
    private readonly eventProcessor: UnicordEventProcessor;
    private readonly gatewayManager: UnicordGatewayManager;
    readonly caches: {
        readonly users: UnicordUsersCache;
        readonly channels: UnicordChannelsCache;
        readonly guilds: UnicordGuildsCache;
    };

    constructor(userConfig: UnicordConfig = {}) {
        this.config = defaults(userConfig, UNICORD_CONFIG_DEFAULTS) as UnicordConfigWithDefaults;
        this.discordAPI = new UnicordDiscordAPI(this);
        this.eventProcessor = new UnicordEventProcessor(this);
        this.gatewayManager = new UnicordGatewayManager(this);
        this.caches = {
            users: new UnicordUsersCache(this),
            channels: new UnicordChannelsCache(this),
            guilds: new UnicordGuildsCache(this),
        };
    }

    /**
     * Hydrates a given data object based on the provided expectations.
     *
     * @param data - The data object to be hydrated. Can be of type `Context` or `Message`.
     * @param expectations - An array of expectations that specify what properties should be hydrated.
     *
     * @returns A promise that resolves to the hydrated data object.
     *
     * @throws Will throw an error if an expectation cannot be resolved.
     */
    get hydrate() {
        return hydrate.bind(null, this);
    }

    private registerEvent<Options extends UnicordCommandOptions>(
        type: UnicordEventType,
        event: string,
        handler: UnicordHandler<Options>,
        options: Options = { args: [] } as unknown as Options,
    ) {
        return this.eventProcessor.register(`${type}:${event}`, handler, options);
    }

    emit(type: UnicordEventType, event: string, context: UnicordCommandContext | UnicordEventContext, args: any[]) {
        this.eventProcessor.emit(`${type}:${event}`, context, args);
    }

    registerChatCommand<const Options extends UnicordCommandOptions>(
        event: string,
        handler: UnicordCommandHandler<Options>,
        options: Options = { args: [] } as unknown as Options,
    ): this {
        this.registerEvent(UnicordEventType.ChatCommands, event, handler, options);
        return this;
    }

    registerApplicationCommand<const Options extends UnicordCommandOptions>(
        event: string,
        handler: UnicordCommandHandler<Options>,
        options: Options = { args: [] } as unknown as Options,
    ): this {
        // TODO: Register with Discord API
        this.registerEvent(UnicordEventType.ApplicationCommands, event, handler, options);
        return this;
    }

    // TODO: should have a different signature for events that are not commands
    onEvent(event: string, handler: UnicordEventHandler): this {
        this.registerEvent(UnicordEventType.SystemEvent, event, handler);
        return this;
    }

    sendMessage = async (channel_id: string, message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }

        return Message.fromDiscord(
            await this.discordAPI.post<DiscordMessage>(`/channels/${channel_id}/messages`, message.toJSON()),
        );
    };

    login(token: string | undefined = this.config.token) {
        if (token === null || token === undefined) {
            throw new Error(
                'You must provide a token to login. Either in the Unicord config or when calling `login()`',
            );
        }

        this.config.token = token;

        this.gatewayManager.connect();
    }
}

export * from './types/common';
