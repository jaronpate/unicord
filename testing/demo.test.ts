import { Client, type Context, Intent } from '../src/index';

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

client.chatCommands.register('here', async (context: Context, _args: any[]) => {
    const guild = await context.fetchGuild();
    if (guild !== null) {
        await context.reply(`You are in ${guild.name}`, true); 
    } else {
        await context.reply('This is not a server!', true);
    }
});

client.chatCommands.register('quote', async (context: Context, _args: any[]) => {
    const referenced = context.message.reference;

    let reply = null;
    if (referenced === null || referenced === undefined) {
        reply = await context.reply('No message to quote', true);
        return;
    } else {
        reply = await context.reply(`> "${referenced.content}"\n> — ${referenced.author?.display_name ?? referenced.author?.username}`, true);
        // Save to quote database
        // TODO
    }

    if (reply?.id) {
        const message_id = reply.id;
        setTimeout(() => {
            context.deleteMessage(message_id);
        }, 3000);
    }
});

client.connect();