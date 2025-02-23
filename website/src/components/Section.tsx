import styles from './Section.module.css';

type SectionProps = {
  children: React.ReactNode;
  background?: 'light' | 'dark';
  className?: string;
};

export function Section({ children, background = 'light', className = '' }: SectionProps) {
  return (
    <section className={`${styles.section} ${styles[background]} ${className}`}>
      {children}
    </section>
  );
}
