import { Fragment } from 'react';
import logoMark from '@/ui/assets/logo-mark.svg';
import styles from './BrandPanel.module.css';

type BrandPanelProps = {
  /** Líneas del titular; cada una se muestra en su propio renglón. */
  title?: readonly string[];
  subtitle?: string;
};

const LOGIN_TITLE = ['Tu dinero,', 'sin fronteras.'];
const LOGIN_SUBTITLE = 'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.';

/** Panel de marca del diseño (Figma, nodos 2:3 y 31:3). Por defecto, los textos del login. */
export function BrandPanel({ title = LOGIN_TITLE, subtitle = LOGIN_SUBTITLE }: BrandPanelProps) {
  return (
    <header className={styles.panel}>
      <div className={styles.logo}>
        <img src={logoMark} alt="" width={20} height={44} />
        <span className={styles.logoText}>KynWallet</span>
      </div>

      <div className={styles.headline}>
        <p className={styles.title}>
          {title.map((line, index) => (
            <Fragment key={line}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.card} aria-hidden="true">
        <div className={styles.cardTop}>
          <span className={styles.cardName}>Kyn Card</span>
          <span className={styles.chip} />
        </div>
        <span className={styles.cardNumber}>{'5294  ••••  ••••  4827'}</span>
        <div className={styles.cardBottom}>
          <span>STEVEN LUNA</span>
          <span>12/29</span>
        </div>
      </div>
    </header>
  );
}
