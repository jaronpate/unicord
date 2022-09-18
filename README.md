<div align="center">
    <h2>discord.ts</h2>
    <p>Build good bots fast</p>
</div>

> This package is in an early Alpha stage and not yet ready for consumption

A solid and simple Discord API wrapper.

## Installation
```
yarn add @jaronp/discord.ts
```

## Quick Start
A small example implementation.
```ts
import { Client } from '@jaronp/discord.ts';

// Initialize and configure
const bot = new Client({
    token: '<token>',
    application_id: '<application_id>',
    intents: [
        Intent.GUILDS,
        Intent.GUILD_MESSAGES,
        Intent.GUILD_MESSAGE_REACTIONS,
        Intent.MESSAGE_CONTENT
    ]
});

// Register a listener
bot.handlers.register('READY', (client, context, data) => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Register a command
bot.commands.register('ping', (client, context, args) => {
    context.reply('Pong!', true);
});

// Connect
bot.connect();
```

## Interactions
First create the interactions.
```ts
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
```ts
bot.interactions.register('click_me', async (client, context, interaction) => {
    const response = context.reply(
        `You clicked me! Thank you ${interaction.member.user.username} <3`
    );
});
```