'use client';

import { useState } from 'react';
import styles from '../app/page.module.css';

const PACKAGE_MANAGERS = {
    npm: 'npm install unicord',
    yarn: 'yarn add unicord',
    pnpm: 'pnpm add unicord',
    bun: 'bun add unicord'
} as const;

type PackageManagerType = keyof typeof PACKAGE_MANAGERS;

export function PackageManager() {
    const [activeTab, setActiveTab] = useState<PackageManagerType>('npm');

    return (
        <div>
            <div className={styles.packageManagerTabs}>
                {(Object.keys(PACKAGE_MANAGERS) as PackageManagerType[]).map(manager => (
                    <button 
                        key={manager}
                        className={`${styles.tabButton} ${activeTab === manager ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(manager)}
                    >
                        {manager}
                    </button>
                ))}
            </div>
            <div className={styles.installCommandWrapper}>
                <code className={styles.installCommand}>
                    {PACKAGE_MANAGERS[activeTab]}
                </code>
                <button 
                    className={styles.copyButton}
                    onClick={() => navigator.clipboard.writeText(PACKAGE_MANAGERS[activeTab])}
                >
                    Copy
                </button>
            </div>
        </div>
    );
}
