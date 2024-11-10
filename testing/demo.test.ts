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
    await context.reply(`Pong!: got ${args.join(', ')}`, true)
});

client.chatCommands.register('here', async (context: Context, _args: any[]) => {
    const guild = await context.fetchGuild();
    if (guild !== null) {
        await context.reply(`You are in ${guild?.name}`, true); 
    } else {
        await context.reply('You are not in a guild', true);
    }
});

client.chatCommands.register('quote', async (context: Context, args: any[]) => {
    const referenced = await context.message.getReference();
    if (referenced === null) {
        await context.reply('No message to quote', true);
        return;
    } else {
        await context.reply(`> "${referenced.content}"\n> — ${referenced.author?.global_name}`, true);
    }
});

client.connect();