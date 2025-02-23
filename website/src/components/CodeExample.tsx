'use client';

import { useRef } from 'react';
import Editor from "@monaco-editor/react";
import styles from './CodeExample.module.css';

const exampleCode = `\
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

export default function CodeExample() {
    return (
        <div className={styles.editorContainer}>
            <Editor
                height="100%"
                defaultLanguage="typescript"
                defaultValue={exampleCode}
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
    );
}
