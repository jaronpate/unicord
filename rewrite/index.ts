import { UnicordChannelsCache, UnicordGuildsCache, UnicordUsersCache } from './caches';
import { UnicordCommandManager } from './commandManager';
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
import { setDefaults } from './utils';

const UNICORD_CONFIG_DEFAULTS = {
    intents: [Intent.DEFAULT],
};

export class Unicord {
    readonly config: UnicordConfigWithDefaults;
    readonly discordAPI: UnicordDiscordAPI;
    private readonly eventProcessor: UnicordEventProcessor;
    private readonly gatewayManager: UnicordGatewayManager;
    private readonly commandManager: UnicordCommandManager;
    readonly caches: {
        readonly users: UnicordUsersCache;
        readonly channels: UnicordChannelsCache;
        readonly guilds: UnicordGuildsCache;
    };

    constructor(userConfig: UnicordConfig = {}) {
        this.config = setDefaults<UnicordConfigWithDefaults>(userConfig, UNICORD_CONFIG_DEFAULTS);
        this.discordAPI = new UnicordDiscordAPI(this);
        this.eventProcessor = new UnicordEventProcessor(this);
        this.gatewayManager = new UnicordGatewayManager(this);
        this.commandManager = new UnicordCommandManager(this, this.eventProcessor);
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

    private __onEvent<Options extends UnicordCommandOptions>(
        type: UnicordEventType,
        event: string,
        handler: UnicordHandler<Options>,
    ) {
        return this.eventProcessor.register(`${type}:${event}`, handler);
    }

    // This is kinda dumb maybe just remove
    // use(client: Unicord): this {
    //     this.commandManager.merge(client.commandManager);
    //     // TODO: inherit event listeners too
    //     return this;
    // }

    emitSystem(event: string, payload: UnicordEventContext) {
        return this.eventProcessor.emitSystem(event, payload);
    }

    emitCommand(
        type: UnicordEventType.ChatCommands | UnicordEventType.ApplicationCommands,
        event: string,
        context: UnicordCommandContext,
        args: any[],
    ) {
        return this.eventProcessor.emitCommand(type, event, context, args);
    }

    // TODO: can we automate defining these methods with some TS magic?
    registerChatCommand<const Options extends UnicordCommandOptions>(
        event: string,
        handler: UnicordCommandHandler<Options>,
        options: Options = { args: [] } as unknown as Options,
    ): this {
        this.commandManager.registerChatCommand(event, handler, options);
        return this;
    }

    registerApplicationCommand<const Options extends UnicordCommandOptions>(
        event: string,
        handler: UnicordCommandHandler<Options>,
        options: Options = { args: [] } as unknown as Options,
    ): this {
        this.commandManager.registerApplicationCommand(event, handler, options);
        return this;
    }

    onEvent(event: string, handler: UnicordEventHandler): this {
        this.__onEvent(UnicordEventType.SystemEvent, event, handler);
        return this;
    }

    onSystemEvent(event: string, handler: UnicordEventHandler): void {
        this.__onEvent(UnicordEventType.SystemEvent, event, handler);
    }

    sendMessage = async (channel_id: string, message: Message | string) => {
        if (typeof message === 'string') {
            message = new Message().setContent(message);
        }

        return Message.fromDiscord(
            await this.discordAPI.post<DiscordMessage>(`/channels/${channel_id}/messages`, message.toJSON()),
        );
    };

    login(token: string | undefined = this.config.token): this {
        if (token === null || token === undefined) {
            throw new Error(
                'You must provide a token to login. Either in the Unicord config or when calling `login()`',
            );
        }

        this.config.token = token;

        this.gatewayManager.connect();
        return this;
    }
}

export * from './types/common';
// export * from './types/message';
// export * from './types/channel';
// export * from './types/guild';
// export * from './types/embed';
