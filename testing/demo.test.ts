import { ApplicationCommandType, Client, CommandOptionType, ComponentStyle, type Context, createCommandHandler, Expectation, Intent, InteractionCommpoentData, type InteractionData, Message, type MessagePayload } from '../src/index';

const client = new Client({
    token: process.env.BOT_TOKEN!,
    application_id: process.env.APPLICATION_ID!,
    intents: [
        Intent.GUILDS,
        Intent.GUILD_MESSAGES,
        Intent.GUILD_MESSAGE_REACTIONS,
        Intent.MESSAGE_CONTENT
    ],
    prefix: '!!'
});

// Register arbitrary event handler to the client bus
client.on('READY', async (_, payload) => {
    console.log(`Logged in as ${payload.user.username}${payload.user.discriminator?.length > 0 ? `#${payload.user.discriminator}` : ''}`);
});

// Register a chat command
client.chatCommands.register('ping', async (context: Context, args: any[]) => {
    const { message } = await context.hydrate(context, [Expectation.Message]);
    const response = await context.reply(`Pong!: got ${args.join(', ')}`, true);
    // Calculate the time it took to send the message
    const time = message.timestamp.getTime() - message.timestamp.getTime();
    // Edit the message to include the time
    await context.editMessage(response, `Pong! Latency: ${time}ms`);
});

// Register an application command
client.applicationCommands.register('hello', ApplicationCommandType.Chat, createCommandHandler({
    description: "Introduce yourself",
    args: [
        {
            type: CommandOptionType.String,
            name: "name",
            id: "name",
            description: "Your name",
            required: true
        },
        {
            type: CommandOptionType.Integer,
            name: "age",
            id: "age",
            description: "Your age",
            required: true
        },
        {
            type: CommandOptionType.String,
            name: "favorite_animal",
            id: "favorite_animal",
            description: "Your favorite animal",
            required: false,
            choices: [
                { name: "Dog", value: "dog" },
                { name: "Cat", value: "cat" },
                { name: "Bird", value: "bird" },
                { name: "Shark", value: "shark" },
                { name: "Elephant", value: "elephant" },
                { name: "Tiger", value: "Tiger" },
                { name: "Lion", value: "lion" },
                { name: "Bear", value: "Bear" }
            ]
        }
    ] as const,
    execute: async (context, args) => {
        context.reply(
            `\
Hello ${args.name}! I see you are ${args.age} years old${!!args.favorite_animal ? ` and your favorite animal is ${args.favorite_animal}.`: '.'}      
Nice to meet you, I'm ${context.self.username}!`
        , true);
    }
}));

// BUG: Repeated hydration does not type narrow correctly. See below.
// Repeated hydration
client.chatCommands.register('me', async (context: Context, _args: any[]) => {
    // Note: Testing repeated hydration
    const { message } = await context.hydrate(context, [Expectation.Message])
    const hydrated = await context.hydrate(message, [Expectation.Channel])
    const rehydrated = await context.hydrate(hydrated, [Expectation.Guild]);
    rehydrated.guild.name

    const hydrate = await context.hydrator(hydrated, [Expectation.Guild]);
    const hasGuild = hydrate(hydrated);

    if (hasGuild) {
        // Send a message stating the user that they are in a guild
        await context.reply(`You are ${message.author.username} and this is ${hydrated.guild.name}`, true);
    } else {
        // Send a message stating the user that they are not in a guild
        await context.reply(`You are ${message.author.username} and we are not in a server`, true);
    }

    // await context.reply(`You are ${message.author.username} ${hasGuild ? message.guild.name : ''}`, true);
});

// Hydrator - hydration function generator
client.chatCommands.register('here', async (context: Context, _args: any[]) => {
    const guild = (await context.hydrator(context, [Expectation.Guild]))(context);

    if (guild) {
        await context.reply(`You are in ${context.guild.name}`, true); 
    } else {
        await context.reply('This is not a server!', true);
    }
});

// Interactions
client.chatCommands.register('demo', async (context: Context, _args: any[]) => {
    const msg = new Message()
        .setContent('Hello World!')
        .addComponent(
            'This is an action row',
            // Max buttons in a row is 5
            // Custom ID is required and must be unique
            // Non-Link buttons can not have a URL
            // Link buttons can not have a custom ID
            Message.button({
                label: 'Click me!',
                style: ComponentStyle.Primary,
                custom_id: 'button_1'
            }),
            Message.button({
                label: 'No me!',
                style: ComponentStyle.Secondary,
                custom_id: 'button_2',
                disabled: true
            }),
            Message.button({
                label: 'Never, me!',
                style: ComponentStyle.Success,
                custom_id: 'button_3'
            }),
            // Link requires url and can not have custom_id
            Message.button({
                label: 'Piss off.',
                style: ComponentStyle.Link,
                url: 'https://example.com'
            }),
            Message.button({
                label: 'Emoji',
                style: ComponentStyle.Secondary,
                custom_id: 'button_4',
                emoji: {
                    name: '👍',
                    id: null,
                    animated: false
                }
            })
        )
        .addComponent(
            Message.button({
                label: 'Bad :(',
                style: ComponentStyle.Danger,
                custom_id: 'button_5'
            }),
            Message.button({
                label: 'More Bad :(',
                style: ComponentStyle.Danger,
                custom_id: 'button_6'
            })
        )
        .addComponent(
            Message.selectMenu({
                custom_id: 'select_1',
                options: [
                    {
                        label: 'Select me',
                        value: 'select_me',
                        description: 'This is a description',
                        emoji: {
                            name: '👍',
                            id: null,
                            animated: false
                        }
                    }
                ],
                placeholder: 'Select an option',
                min_values: 1,
                max_values: 1
            })
        );

    context.reply(msg);
});

const buttonInteractionHandler = (context: Context, data: InteractionCommpoentData) => {
    context.reply(`You clicked the ${data.custom_id} button!`);
};

client.interactions.register('button_1', buttonInteractionHandler);
client.interactions.register('button_2', buttonInteractionHandler);
client.interactions.register('button_3', buttonInteractionHandler);
client.interactions.register('button_4', buttonInteractionHandler);
client.interactions.register('button_5', buttonInteractionHandler);
client.interactions.register('button_6', buttonInteractionHandler);

client.interactions.register('select_1', async (context: Context, data: InteractionCommpoentData) => {
    if (data?.values !== undefined) {
        context.reply(`You selected ${data.values[0]}!`);
    } else {
        context.reply('You selected nothing!');
    }
});

client.connect();