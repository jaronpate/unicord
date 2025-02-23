import styles from "./page.module.css";
import dynamic from 'next/dynamic';

const CodeExample = dynamic(
  () => import('../components/CodeExample')
);

import { simpleExample, hydrationExample } from '../components/CodeExample';

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
                    <div className={styles.codeExample}>
                        <CodeExample code={simpleExample} noScroll={true} />
                    </div>
                </div>

                <div className={styles.pillars}>
                    <div className={styles.pillarContainer}>
                        <div className={styles.pillar}>
                            <div className={styles.pillarIcon}>⚡</div>
                            <h2>Simple</h2>
                            <p>Build Discord bots with minimal boilerplate and intuitive APIs</p>
                        </div>
                        <div className={styles.pillar}>
                            <div className={styles.pillarIcon}>🔧</div>
                            <h2>Maintainable</h2>
                            <p>Type-safe, modular architecture that scales with your project</p>
                        </div>
                        <div className={styles.pillar}>
                            <div className={styles.pillarIcon}>📈</div>
                            <h2>Scalable</h2>
                            <p>Efficient caching and event handling for bots of any size</p>
                        </div>
                    </div>
                </div>

                <div className={styles.hydrationSection}>
                    <div className={styles.hydrationContainer}>
                        <div className={styles.hydrationCode}>
                            <CodeExample code={hydrationExample} height={260} noScroll={true} />
                        </div>
                        <div className={styles.hydrationText}>
                            <h2>Smart Hydration</h2>
                            <p>
                                Unicord's hydration system automatically manages Discord object lifecycles. 
                                The context.hydrate method intelligently fetches and caches Discord objects 
                                like messages, users, and guilds, ensuring your bot stays efficient while 
                                keeping your code clean and predictable.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
