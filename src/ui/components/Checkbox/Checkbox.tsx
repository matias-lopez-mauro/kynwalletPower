import { useId, type ReactNode, type Ref } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Nombre accesible cuando la etiqueta visible se completa con `after` (002 ui-registro.md). */
  accessibleName?: string;
  /** Contenido interactivo junto a la etiqueta, fuera del `<label>`. */
  after?: ReactNode;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Checkbox({
  label,
  checked,
  onChange,
  accessibleName,
  after,
  error,
  ref,
}: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <div className={styles.wrapper}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={[styles.box, error && styles.invalid].filter(Boolean).join(' ')}
          checked={checked}
          aria-label={accessibleName}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {after}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
