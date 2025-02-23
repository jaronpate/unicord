import styles from './Logo.module.css';

type LogoProps = {
  size?: 'small' | 'large';
  showImage?: boolean;
};

export function Logo({ size = 'small', showImage = true }: LogoProps) {
  return (
    <div className={`${styles.logo} ${styles[size]}`}>
      {showImage && <img src="/unicord.png" alt="Unicord logo" />}
      <div><span className={styles.highlight}>uni</span>cord</div>
    </div>
  );
}
