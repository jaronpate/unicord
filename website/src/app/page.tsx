import styles from "./page.module.css";
import dynamic from 'next/dynamic';

const CodeExample = dynamic(
  () => import('../components/CodeExample')
);

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
                        <CodeExample />
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
