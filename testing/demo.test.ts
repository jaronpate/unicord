import { Client, type Context, createCommandHandler, Expectation, Intent, type MessagePayload } from '../src/index';
import { ApplicationCommandOptionType, ApplicationCommandType } from '../src/types/applicationCommand';

const client = new Client({
    token: process.env.BOT_TOKEN!,
    application_id: process.env.APPLICATION_ID!,
    intents: [
        Intent.GUILDS,
        Intent.GUILD_MESSAGES,
        Intent.GUILD_MESSAGE_REACTIONS,
        Intent.MESSAGE_CONTENT
    ],
    prefix: '!'
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
            type: ApplicationCommandOptionType.String,
            name: "name",
            id: "name",
            description: "Your name",
            required: true
        },
        {
            type: ApplicationCommandOptionType.Integer,
            name: "age",
            id: "age",
            description: "Your age",
            required: true
        },
        {
            type: ApplicationCommandOptionType.String,
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

// Repeated hydration
client.chatCommands.register('me', async (context: Context, _args: any[]) => {
    // Note: Testing repeated hydration
    const { message } = await context.hydrate(context, [Expectation.Message])
    const hydrated = await context.hydrate(message, [Expectation.Channel])
    const rehydrated = await context.hydrate(hydrated, [Expectation.Guild]);

    rehydrated.guild.name

    const hydrate = await context.hydrator(hydrated, [Expectation.Guild]);
    const hasGuild = hydrate(hydrated);

    // if (hasGuild) {
    //     hydrated.guild.name
    // } else {
    //     hydrated
    // }

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

client.connect();