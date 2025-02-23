'use client';

import { useState } from 'react';
import styles from './PackageManager.module.css';

const PACKAGE_MANAGERS = {
  npm: 'npm install unicord',
  yarn: 'yarn add unicord',
  pnpm: 'pnpm add unicord',
  bun: 'bun add unicord'
} as const;

export function PackageManager() {
  const [activeTab, setActiveTab] = useState<keyof typeof PACKAGE_MANAGERS>('npm');

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {Object.keys(PACKAGE_MANAGERS).map(pm => (
          <button 
            key={pm}
            className={`${styles.tab} ${activeTab === pm ? styles.active : ''}`}
            onClick={() => setActiveTab(pm as keyof typeof PACKAGE_MANAGERS)}
          >
            {pm}
          </button>
        ))}
      </div>
      <div className={styles.commandWrapper}>
        <code className={styles.command}>
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
