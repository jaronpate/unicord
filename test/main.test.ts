import * as dotenv from 'dotenv';
dotenv.config();

import { Client, ComponentStyle, Intent, Message } from '../src';

const bot = new Client({
    token: process.env.BOT_TOKEN!,
    application_id: process.env.APPLICATION_ID!,
    intents: [Intent.GUILDS, Intent.GUILD_MESSAGES, Intent.GUILD_MESSAGE_REACTIONS, Intent.MESSAGE_CONTENT]
});

bot.commands.register('ping', (client, context, args) => {
    context.reply('Pong!', true);
});

bot.commands.register('demo', (_client, context, _args) => {
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
                custom_id: '1'
            }),
            Message.button({
                label: 'No me!',
                style: ComponentStyle.Secondary,
                custom_id: '2',
                disabled: true
            }),
            Message.button({
                label: 'Never, me!',
                style: ComponentStyle.Success,
                custom_id: '3'
            }),
            // Link requires url and can not have custom_id
            Message.button({
                label: 'Screw Them.',
                style: ComponentStyle.Link,
                url: 'https://google.com'
            }),
            Message.button({
                label: 'Emoji',
                style: ComponentStyle.Secondary,
                custom_id: '4',
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
                custom_id: '5'
            }),
            Message.button({
                label: 'More Bad :(',
                style: ComponentStyle.Danger,
                custom_id: '6'
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

bot.commands.register('test', (_client, context, _args) => {
    const msg = new Message().setContent('This is a test interaction!').addComponent(
        'This is an action row',
        Message.button({
            label: 'Click me!',
            style: ComponentStyle.Primary,
            custom_id: 'click_me',
            emoji: {
                name: '🔥',
                id: null,
                animated: false
            }
        }),
        Message.button({
            label: 'Never, me!',
            style: ComponentStyle.Success,
            custom_id: 'never_me'
        }),
        // Link requires url and can not have custom_id
        Message.button({
            label: 'Screw Them.',
            style: ComponentStyle.Link,
            url: 'https://google.com'
        })
    );
    context.reply(msg);
});

bot.handlers.register('READY', (client, context, data) => {
    console.log(`Logged in as ${client.user.tag}`);
});

bot.interactions.register('never_me', async (client, context, interaction) => {
    const reply = await context.loading();
    setTimeout(() => {
        reply.editOriginal(`You clicked me! Thank you ${interaction.member.user.username} <3`);
    }, 1000);
});

bot.interactions.register('click_me', async (client, context, interaction) => {
    const reply = await context.loading();
    setTimeout(() => {
        reply.editOriginal(
            new Message().addComponent(
                Message.button({
                    label: 'Click me!',
                    style: ComponentStyle.Primary,
                    custom_id: '1'
                })
            )
        );
    }, 1000);
});

bot.connect();
