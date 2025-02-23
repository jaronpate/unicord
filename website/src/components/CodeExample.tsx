'use client';

import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
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
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current) {
            const editor = monaco.editor.create(editorRef.current, {
                value: exampleCode,
                language: 'typescript',
                theme: 'vs-dark',
                minimap: { enabled: false },
                readOnly: true,
                automaticLayout: true,
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                roundedSelection: false,
                padding: { top: 16, bottom: 16 },
            });

            return () => editor.dispose();
        }
    }, []);

    return <div className={styles.editorContainer} ref={editorRef} />;
}
