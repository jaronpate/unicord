<div align="center">
    <img src="https://raw.githubusercontent.com/jaronpate/unicord/master/assets/unicord.png" width="150" height="150">
    <h2>unicord</h2>
    <p><em>Build good bots fast</em></p>
</div>

> This package is in early development and is not yet ready for production use. Please be aware that the API may change at any time. Use at your own risk.

This library is designed with three pillars in mind: **Simple**, **Maintainable**, and **Scalable**. It isn't guaranteed to be the fastest or the most feature rich, but you will probably find it to be the easiest to use and understand.

It's typecript first and has some nifty features like hydration and argument type resolution. The goal here is to not have to worry about if you are using the Gateway, Webhooks, or Application commands. Ideally there is a single API that can be used to inferface with Discord.

## Installation

Install with your package manager of choice.

```
npm install unicord
yarn add unicord
bun add unicord
```

## Quick Start

A small example implementation.
```typescript
import { Client, type Context } from 'unicord';

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
import { createCommandHandler, CommandOptionType, type Context } from 'unicord';

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

## Interactions

First create the interactions.

```typescript
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
            })
        );

    context.reply(msg);
});
```

Then provide a handler for them.

```typescript
const buttonInteractionHandler = (context: Context, data: InteractionCommpoentData) => {
    context.reply(`You clicked the ${data.custom_id} button!`);
};

client.interactions.register('button_1', buttonInteractionHandler);
client.interactions.register('button_2', buttonInteractionHandler);
client.interactions.register('button_3', buttonInteractionHandler);
```
