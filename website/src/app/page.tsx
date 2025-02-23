'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import dynamic from 'next/dynamic';

const CodeExample = dynamic(
  () => import('../components/CodeExample')
);

import { simpleExample, hydrationExample, typeCoercionExample } from '../components/CodeExample';

export default function Home() {
    const [activeTab, setActiveTab] = useState('npm');
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
                            <CodeExample code={hydrationExample} height={245} noScroll={true} />
                        </div>
                        <div className={styles.hydrationText}>
                            <h2>Smart Hydration</h2>
                            <p>
                                Unicord's hydration system automatically manages Discord object lifecycles. 
                                The <code>context.hydrate</code> method intelligently fetches and caches Discord objects 
                                like messages, users, and guilds, ensuring your bot stays efficient while 
                                keeping your code clean and predictable.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.typeSection}>
                    <div className={styles.typeContainer}>
                        <div className={styles.typeText}>
                            <h2>Type Coercion</h2>
                            <p>
                                Unicord automatically handles type coercion for command arguments, 
                                ensuring you always get the correct types in your handlers. Define your 
                                command structure once, and get full type safety and autocompletion 
                                throughout your codebase.
                            </p>
                            <p>
                                In this example, the <code>user</code> argument is automatically typed 
                                as a <code>User</code> object, providing access to all user properties 
                                with full TypeScript support.
                            </p>
                        </div>
                        <div className={styles.typeCode}>
                            <CodeExample code={typeCoercionExample} height={370} noScroll={true} />
                        </div>
                    </div>
                </div>

                <div className={styles.installSection}>
                    <div className={styles.installContainer}>
                        <h2>Install <span className={styles.logoMarkSpan}>uni</span>cord</h2>
                        <div className={styles.packageManagerTabs}>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'npm' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('npm')}
                            >
                                npm
                            </button>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'yarn' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('yarn')}
                            >
                                yarn
                            </button>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'pnpm' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('pnpm')}
                            >
                                pnpm
                            </button>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'bun' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('bun')}
                            >
                                bun
                            </button>
                        </div>
                        <div className={styles.installCommandWrapper}>
                            <code className={styles.installCommand}>
                                {activeTab === 'npm' && 'npm install unicord'}
                                {activeTab === 'yarn' && 'yarn add unicord'}
                                {activeTab === 'pnpm' && 'pnpm add unicord'}
                                {activeTab === 'bun' && 'bun add unicord'}
                            </code>
                            <button 
                                className={styles.copyButton}
                                onClick={() => {
                                    const commands = {
                                        npm: 'npm install unicord',
                                        yarn: 'yarn add unicord',
                                        pnpm: 'pnpm add unicord',
                                        bun: 'bun add unicord'
                                    };
                                    navigator.clipboard.writeText(commands[activeTab as keyof typeof commands]);
                                }}
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
