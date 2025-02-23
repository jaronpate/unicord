import styles from './Feature.module.css';
import { CodeExample } from './CodeExample';

type FeatureProps = {
  title: string;
  description: React.ReactNode;
  code?: string;
  codeHeight?: number;
  reversed?: boolean;
};

export function Feature({ title, description, code, codeHeight, reversed = false }: FeatureProps) {
  const content = (
    <>
      <div className={styles.text}>
        <h2>{title}</h2>
        <div className={styles.description}>{description}</div>
      </div>
      {code && (
        <div className={styles.code}>
          <CodeExample code={code} height={codeHeight} noScroll={true} />
        </div>
      )}
    </>
  );

  return (
    <div className={`${styles.feature} ${reversed ? styles.reversed : ''}`}>
      {content}
    </div>
  );
}
