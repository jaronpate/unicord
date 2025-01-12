<div align="center">
    <h2>discord.ts</h2>
    <p>Build good bots fast</p>
</div>

> This package is in an early beta stage and not yet ready for consumption

A solid and simple Discord API wrapper.

## Installation

Install with your package manager of choice.

```
npm install discord.ts
yarn add discord.ts
bun add discord.ts
```

## Quick Start

A small example implementation.
```typescript
import { Client, type Context } from '`discord.ts';

// Initialize and configure
const client = new Client({
    token: '<token>',
    application_id: '<application_id>',
    intents: [
        Intent.GUILDS,
        Intent.GUILD_MESSAGES,
        Intent.GUILD_MESSAGE_REACTIONS,
        Intent.MESSAGE_CONTENT
    ],
    prefix: '??'
});

// Register arbitrary event handler to the client bus
client.on('READY', async (_, payload) => {
    console.log(`Logged in as ${payload.user.username}${payload.user.discriminator?.length > 0 ? `#${payload.user.discriminator}` : ''}`);
});

// Register a command
client.chatCommands.register('ping', (context: Context, args) => {
    context.reply('Pong!', true);
});

// Connect
client.connect();
```

## Type Resolution and Saftey

This library is designed to be type safe and resolve types for you. Because of this you can write code that is both safe and easy to understand. With the `createCommandHandler` utility you can provide types for command arguments. The client will then check and resolve them for you.

```typescript
import { createCommandHandler, CommandOptionType, type Context } from 'discord.ts';

// <...>

// Define the command handler with the utility function
const avatarCommand = createCommandHandler({
    description: 'Get a users avatar',
    args: [
        {
            id: 'user',
            name: 'user',
            type: CommandOptionType.User,
            description: 'The user to get the avatar for',
            required: true
        }
    ],
    execute: async (context: Context, args) => {
        // Args will be typed here as { user: User }
        context.reply(args.user.avatarURL);
    }
});

// You can then register the command with the client
// The class generated can be used for both chat and application commands
client.chatCommands.register('avatar', avatarCommand);
client.applicationCommands.register('avatar', ApplicationCommandType.Chat, avatarCommand);

// <...>
```

## Hydration

Hydration allows you to fetch and fill data on Discord objects. This is useful for when you need to fetch additional data about an object.

```typescript
client.chatCommands.register('ping', async (context: Context, args: any[]) => {
    // Hydrate the message id from the context
    const { message } = await context.hydrate(context, [Expectation.Message]);
    // Send a message to the channel
    const response = await context.reply(`Pong!: got ${args.join(', ')}`, true);
    // Calculate the time it took to send the message
    const time = message.timestamp.getTime() - message.timestamp.getTime();
    // Edit the message to include the time
    await context.editMessage(response, `Pong! Latency: ${time}ms`);
});
```

This is a powerful feature that allows you to fetch and use data from Discord objects in a type safe way. It also ensures the minimum amount of API calls are made and that no extra data is fetched or passed.

You can also generate a hydration function that returns a type narrowing boolean. This can be used to check if the object is hydrated or not.

```typescript
client.chatCommands.register('me', async (context: Context, _args: any[]) => {
    // Hydrate the message id from the context
    const hydrate = await context.hydrator(hydrated, [Expectation.Guild]);
    // Check if the object is hydrated
    const hasGuild = hydrate(hydrated);

    if (hasGuild) {
        // Send a message stating the user that they are in a guild
        await context.reply(`You are ${message.author.username} and this is ${message.guild.name}`, true);
    } else {
        // Send a message stating the user that they are not in a guild
        await context.reply(`You are ${message.author.username} and we are not in a server`, true);
    }
});
```

Additionally you can hydrate repeatedly if you need to fetch multiple objects at different times.

<!-- 
## Interactions
First create the interactions.
```typescript
bot.commands.register('test', (_client, context, _args) => {
    // Add components to use interactions
    const msg = new Message().setContent('Test interaction!').addComponent(
        // This generations an action row which can optionaly contain content
        'This is an action row',
        // Create components with helper functions
        Message.button({
            label: 'Click me!',
            style: ComponentStyle.Primary,
            // Assign id's to reference them later
            custom_id: 'click_me',
            emoji: {
                name: '🔥',
                id: null,
                animated: false
            }
        })
    );
    context.reply(msg);
});
```
Then provide a handler for them.
```typescript
bot.interactions.register('click_me', async (client, context, interaction) => {
    const response = context.reply(
        `You clicked me! Thank you ${interaction.member.user.username} <3`
    );
});
```
-->