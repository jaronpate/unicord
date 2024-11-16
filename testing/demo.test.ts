import { Client, type Context, createCommandHandler, Expectation, Intent, type MessagePayload, Trait } from '../src/index';

const client = new Client({
    token: process.env.BOT_TOKEN!,
    application_id: process.env.APPLICATION_ID!,
    intents: [
        Intent.GUILDS,
        Intent.GUILD_MESSAGES,
        Intent.GUILD_MESSAGE_REACTIONS,
        Intent.MESSAGE_CONTENT
    ],
    prefix: '??'
});

client.chatCommands.register('ping', async (context: Context, args: any[]) => {
    const message = await context.reply(`Pong!: got ${args.join(', ')}`, true);
    // Calculate the time it took to send the message
    const time = message.timestamp.getTime() - context.message.timestamp.getTime();
    // Edit the message to include the time
    await context.editMessage(message, `Pong! Latency: ${time}ms`);
});

const handler = createCommandHandler({
    args: [
        {
            type: 3,
            name: "name",
            description: "The name of the user",
            required: true
        },
        {
            type: 3,
            name: "age",
            description: "The age of the user",
            required: true,
            choices: [
                { name: "18", value: "18" },
                { name: "19", value: "19" },
                { name: "20", value: "20" }
            ]
        }
    ] as const,
    [Trait.execute]: async (context, args) => {
        context.reply(`You are ${args.name} and you are ${args.age} years old`, true);
    }
});

client.slashCommands.register('ping', handler);

client.chatCommands.register('me', async (context: Context, _args: any[]) => {
    // Note: Testing repeated hydration
    const message = await context.hydrate(context.message, [Expectation.Channel])
    const rehydrated = await context.hydrate(message, [Expectation.Guild]);

    rehydrated.guild.name

    const hydrate = await context.hydrator(message, [Expectation.Guild]);
    const hasGuild = hydrate(message);

    // if (hasGuild) {
    //     message.guild.name
    // } else {
    //     message
    // }

    // await context.reply(`You are ${message.author.username} ${hasGuild ? message.guild.name : ''}`, true);
});

client.chatCommands.register('here', async (context: Context, _args: any[]) => {
    const guild = (await context.hydrator(context, [Expectation.Guild]))(context);

    if (guild) {
        await context.reply(`You are in ${context.guild.name}`, true); 
    } else {
        await context.reply('This is not a server!', true);
    }
});

client.chatCommands.register('quote', async (context: Context, _args: any[]) => {
    const { message, hydrator } = context;
    const reference = (await hydrator(message, [Expectation.Message]))(message);

    let reply: MessagePayload;

    if (reference) {
        reply = await context.reply(`> "${message.reference.content}"\n> — ${message.reference.author.display_name ?? message.reference.author.username}`, true);
        // Save to quote database
        // TODO
    } else {
        reply = await context.reply('No message to quote', true);
    }

    // Wait 3 seconds then delete the quote
    setTimeout(() => {
        context.deleteMessage(reply.id);
    }, 3000);
});

client.connect();