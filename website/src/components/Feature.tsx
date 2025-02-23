'use client';

import { ReactNode } from 'react';
import styles from '../app/page.module.css';
import dynamic from 'next/dynamic';

const CodeExample = dynamic(
    () => import('./CodeExample'),
    { ssr: false }
);

type FeatureProps = {
    title: string;
    description: ReactNode;
    code: string;
    codeHeight?: number;
    reversed?: boolean;
}

export function Feature({ title, description, code, codeHeight, reversed = false }: FeatureProps) {
    const content = (
        <>
            <div className={styles.featureText}>
                <h2>{title}</h2>
                {description}
            </div>
            <div className={styles.featureCode}>
                <CodeExample code={code} height={codeHeight} noScroll={true} />
            </div>
        </>
    );

    return (
        <div className={styles.featureContainer}>
            {reversed ? content : content}
        </div>
    );
}
