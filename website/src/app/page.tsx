import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={[styles.page, styles.pageWithHeader].join(" ")}>
            <header className={styles.header}>
                <div className={styles.logoMark}>
                    <img src="/unicord.png"></img>
                    <div><span className={styles.logoMarkSpan}>uni</span>cord</div>
                </div>
            </header>
            <main className={styles.main}>
                <div className={styles.hero}>
                    <div>
                        <h1 className={styles.title}>
                            Welcome to <span className={styles.logoMarkSpan}>uni</span>cord
                        </h1>
                        <p className={styles.description}>
                            Finally a simpler way to build Discord bots.{" "}
                        </p>
                    </div>
                    <div>
                        <code className={styles.code}>
                            <pre className={styles.codeBlock}>
{`\
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
client.connect();
`}
                            </pre>
                        </code>
                    </div>
                </div>

                <div>
                    <h2 className={styles.title}>Features</h2>
                    <ul className={styles.features}>
                        <li>TypeScript support</li>
                        <li>Intuitive API</li>
                        <li>Powerful command system</li>
                        <li>Built-in event handling</li>
                        <li>Easy to use</li>
                    </ul>
                    <h2 className={styles.title}>Get Started</h2>
                    <p className={styles.description}>
                        To get started, check out the{" "}
                        <a href="https://unicord.dev" target="_blank">
                            <span className={styles.link}>documentation</span>
                        </a>{" "}
                        or join our{" "}
                        <a href="https://discord.gg/9v6Z4J5q" target="_blank">
                            <span className={styles.link}>Discord server</span>
                        </a>{" "}
                        for help and support.
                    </p>
                </div>
            </main>
        </div>
    );
}
