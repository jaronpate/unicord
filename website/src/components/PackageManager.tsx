'use client';

import { useState } from 'react';
import styles from './PackageManager.module.css';

const PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm', 'bun'] as const;
type PackageManager = typeof PACKAGE_MANAGERS[number];

export function PackageManager() {
    const [activeTab, setActiveTab] = useState<PackageManager>('npm');

    const getInstallCommand = (pm: PackageManager) => {
        const commands = {
            npm: 'npm install unicord',
            yarn: 'yarn add unicord',
            pnpm: 'pnpm add unicord',
            bun: 'bun add unicord'
        };
        return commands[pm];
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {PACKAGE_MANAGERS.map(pm => (
                    <button 
                        key={pm}
                        className={`${styles.tab} ${activeTab === pm ? styles.active : ''}`}
                        onClick={() => setActiveTab(pm)}
                    >
                        {pm}
                    </button>
                ))}
            </div>
            <div className={styles.commandWrapper}>
                <code className={styles.command}>
                    {getInstallCommand(activeTab)}
                </code>
                <button 
                    className={styles.copyButton}
                    onClick={() => navigator.clipboard.writeText(getInstallCommand(activeTab))}
                >
                    Copy
                </button>
            </div>
        </div>
    );
}
