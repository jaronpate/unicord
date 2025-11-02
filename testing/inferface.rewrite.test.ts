// Here we are defining what we want the interface to look like so that there is a goal to work towards
// Things here are not necessarily implemented in the actual code but show what we want it to look like to use the library

// import { unicord, t } from 'unicord';
import { Expectation, Unicord, UnicordArgumentType } from '../rewrite/index.ts';

const DISCORD_CLIENT_TOKEN = process.env.BOT_TOKEN!;

// Create a new client instance
// Most usage will be via chaining methods off the client instance
const client = new Unicord({
    token: process.env.BOT_TOKEN!,
})
    .registerChatCommand(
        'ping',
        async (context, args) => {
            let response = 'Pong!';
            response += ` Hello, ${args.name}!`;
            if (!!args.age && args.age > 0) {
                response += ` Happy to hear you are ${args.age} years old.`;
            }
            await context.reply(response);
        },
        {
            description: 'Say hello',
            args: [
                {
                    name: 'name',
                    description: 'Your name',
                    // Maybe we can use t.String() here but only certain types are valid for command options
                    // But in theory we could parse the raw value and attempt convert it to requested type here
                    type: UnicordArgumentType.String,
                    required: true,
                },
                {
                    name: 'age',
                    description: 'Your age',
                    type: UnicordArgumentType.Number,
                    required: false,
                },
            ],
        },
    )
    .registerChatCommand(
        'channel',
        async (context) => {
            const hydrated = await context.hydrate(context, [Expectation.Channel]);
            await context.reply(hydrated.channel.name ?? 'Unnamed Channel');
        },
        {
            description: 'Get info about a channel',
            args: [],
        },
    )
    .registerApplicationCommand(
        'echo',
        async (context, args) => {
            await context.reply('Echo! ' + args.text);
        },
        {
            description: 'Echo command',
            args: [
                {
                    name: 'text',
                    description: 'Text to echo',
                    type: UnicordArgumentType.String,
                    required: true,
                },
            ],
        },
    )
    .onEvent('READY', async (payload) => {
        console.log(`Logged in as ${payload.user.username}`);
    });

// client.login(DISCORD_CLIENT_TOKEN);

// Allow use of "child" instances inside parent instance
const etc = new Unicord().registerChatCommand(
    'zing',
    async (context, args) => {
        await context.reply(`Zing! You got served!` + args.fav_amimal ? ` One ${args.fav_amimal} please!` : '');
    },
    {
        args: [
            {
                name: 'fav_amimal',
                description: 'Your favorite animal',
                type: UnicordArgumentType.String,
                required: false,
                choices: [
                    { name: 'Dog', value: 'dog' },
                    { name: 'Cat', value: 'cat' },
                    { name: 'Hamster', value: 'hamster' },
                    { name: 'Dolphin', value: 'dolphin' },
                ],
            },
        ],
    },
);

client.use(etc);

client.login();