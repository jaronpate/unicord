import styles from './Section.module.css';

type SectionProps = {
  children: React.ReactNode;
  background?: 'default' | 'dark';
  className?: string;
};

export function Section({ children, background = 'default', className = '' }: SectionProps) {
  return (
    <div className={`${styles.section} ${styles[background]} ${className}`}>
      {children}
    </div>
  );
}
