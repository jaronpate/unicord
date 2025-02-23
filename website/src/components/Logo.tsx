'use client';

import styles from '../app/page.module.css';

type LogoProps = {
    size?: 'small' | 'large';
    showImage?: boolean;
}

export function Logo({ size = 'small', showImage = true }: LogoProps) {
    return (
        <div className={styles.logoMark}>
            {showImage && <img src="/unicord.png" alt="Unicord logo" />}
            <div><span className={styles.logoMarkSpan}>uni</span>cord</div>
        </div>
    );
}
