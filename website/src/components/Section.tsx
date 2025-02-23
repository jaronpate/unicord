'use client';

import { ReactNode } from 'react';
import styles from '../app/page.module.css';

type SectionProps = {
    children: ReactNode;
    background?: 'light' | 'dark';
    className?: string;
}

export function Section({ children, background = 'light', className = '' }: SectionProps) {
    return (
        <div className={[
            className,
            background === 'dark' ? styles.darkSection : ''
        ].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}
