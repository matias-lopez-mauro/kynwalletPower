import type { ComponentProps, ReactNode } from 'react';
import { BrandPanel } from '@/ui/layout/BrandPanel/BrandPanel';
import styles from './LoginScreen.module.css';

type LoginScreenProps = ComponentProps<typeof BrandPanel> & { children: ReactNode };

/** Layout de dos paneles compartido por el login y el registro. */
export function LoginScreen({ children, ...brand }: LoginScreenProps) {
  return (
    <div className={styles.screen}>
      <BrandPanel {...brand} />
      <main className={styles.formPanel}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
