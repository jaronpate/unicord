'use client';

import Editor, { Monaco } from "@monaco-editor/react";
import styles from './CodeExample.module.css';
import { useEffect, useState } from "react";

type CodeExampleProps = {
    code: string;
    height?: string | number;
    noScroll?: boolean;
}


export default function CodeExample({ code, height = "100%", noScroll = false }: CodeExampleProps) {
    // const [unicordLib, setUnicordLib] = useState("");

    // useEffect(() => {
    //     setUnicordLib(`
    //         declare module 'unicord' {
    //             export enum Intent {
    //                 GUILDS = 1 << 0,
    //             }
    //         }
    //     `);
        
    // }, []);

    // const handleEditorDidMount = (monaco: Monaco) => {
    //     monaco.languages.typescript.typescriptDefaults.addExtraLib(unicordLib);

    //     monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    //         noSemanticValidation: false,
    //         noSyntaxValidation: false,
    //         noSuggestionDiagnostics: false,
    //     });
    //     monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    //         target: monaco.languages.typescript.ScriptTarget.ESNext,
    //         module: monaco.languages.typescript.ModuleKind.ESNext,
    //         allowJs: true,
    //         checkJs: true,
    //         allowNonTsExtensions: true,
    //         strict: true,
    //         noEmit: true,
    //         lib: [
    //             "ESNext",
    //             "DOM",
    //             "DOM.Iterable",
    //             "ESNext.AsyncIterable",
    //             "ESNext.BigInt"
    //         ],
    //         types: ["node", "unicord"],
    //         baseUrl: "./",
    //         paths: {
    //             "index": ["./src/index.ts"],
    //             "unicord": ["./node_modules/unicord/dist/index.d.ts"]
    //         }
    //     });

    // };

    // useEffect(() => {
    //     fetch("https://www.unpkg.com/unicord@0.0.4/out/types/common.d.ts")
    //         .then((response) => response.text())
    //         .then((text) => {
    //             setUnicordLib(text);
    //             console.log("Fetched extra lib:", text);
    //         })
    //         .catch((error) => {
    //             console.error("Error fetching extra lib:", error);
    //         });
    // }, []);
    
    return (
        <div className={styles.editorWrapper}>
            <div className={styles.editorContainer}>
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
                        scrollbar: {
                            alwaysConsumeMouseWheel: !noScroll,
                        }
                    }}
                    // beforeMount={handleEditorDidMount}
                />
            </div>
        </div>
    );
}

// Export the example code snippets for reuse
export const simpleExample = `\
import { Client, type Context, Intent } from 'unicord';

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

export const typeCoercionExample = `\
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
});`;
