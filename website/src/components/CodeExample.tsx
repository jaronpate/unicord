'use client';

import Editor from "@monaco-editor/react";
import styles from './CodeExample.module.css';

type CodeExampleProps = {
    code: string;
    height?: string | number;
    noScroll?: boolean;
}

export default function CodeExample({ code, height = "100%", noScroll = false }: CodeExampleProps) {
    return (
        <div className={styles.editorWrapper}>
            <div className={styles.editorContainer} style={{ pointerEvents: noScroll ? 'none' : 'auto' }}>
                <Editor
                    height={height}
                    defaultLanguage="typescript"
                    defaultValue={code}
                    theme="vs-dark"
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        roundedSelection: false,
                        padding: { top: 16, bottom: 16 },
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
}

// Export the example code snippets for reuse
export const simpleExample = `\
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

// Register a command
client.chatCommands.register('ping', (context: Context, args) => {
    context.reply('Pong!', true);
});

// Connect
client.connect();`;

export const hydrationExample = `\
client.chatCommands.register('ping', async (context: Context, args: any[]) => {
    // Hydrate the message id from the context
    const { message } = await context.hydrate(context, [Expectation.Message]);
    // Send a message to the channel
    const response = await context.reply(\`Pong!: got \${args.join(', ')}\`, true);
    // Calculate the time it took to send the message
    const time = message.timestamp.getTime() - message.timestamp.getTime();
    // Edit the message to include the time
    await context.editMessage(response, \`Pong! Latency: \${time}ms\`);
});`;
