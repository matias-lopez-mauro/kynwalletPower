import { useCallback, useRef, type FormEvent } from 'react';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { Alert } from '@/ui/components/Alert/Alert';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Divider } from '@/ui/components/Divider/Divider';
import { PasswordField } from '@/ui/components/PasswordField/PasswordField';
import { SocialButton } from '@/ui/components/SocialButton/SocialButton';
import { TextField } from '@/ui/components/TextField/TextField';
import type { RegisterField } from './registerReducer';
import { useRegisterForm, type RegisteredAccount } from './useRegisterForm';
import formStyles from '@/ui/forms/authForm.module.css';
import styles from './RegisterForm.module.css';

/** Textos del panel de marca en el frame `04 · Registro` (Figma, nodo 31:2). */
export const REGISTER_BRAND = {
  title: ['Comienza tu', 'camino financiero.'],
  subtitle:
    'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
} as const;

const FIELD_ORDER: readonly RegisterField[] = [
  'fullName',
  'email',
  'password',
  'confirmPassword',
  'acceptedTerms',
];

type RegisterFormProps = {
  register: Register;
  onRegistered: (account: RegisteredAccount) => void;
  /** Vuelve al login sin conservar datos (002 US5-2). */
  onLogin: () => void;
};

export function RegisterForm({ register, onRegistered, onLogin }: RegisterFormProps) {
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const onEmailTaken = useCallback(() => emailRef.current?.focus(), [emailRef]);
  const { state, change, toggleTerms, blur, submit, showNotice } = useRegisterForm(register, {
    onRegistered,
    onEmailTaken,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = submit();
    // US2-1: el foco va al primer campo con error.
    const refs = {
      fullName: fullNameRef,
      email: emailRef,
      password: passwordRef,
      confirmPassword: confirmPasswordRef,
      acceptedTerms: termsRef,
    };
    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) refs[firstInvalid].current?.focus();
  };

  // FR-020: elementos del diseño fuera del alcance de la demostración.
  const notAvailable = () => showNotice(MESSAGES.FEATURE_UNAVAILABLE);
  // FR-020a: el registro con Google o Apple se anuncia como próximo.
  const comingSoon = () => showNotice(MESSAGES.COMING_SOON);

  return (
    <form className={formStyles.form} noValidate onSubmit={handleSubmit}>
      <div className={formStyles.heading}>
        <h1 className={formStyles.title}>Crea tu cuenta</h1>
        <p className={formStyles.subtitle}>Completa tus datos para comenzar</p>
      </div>

      <div className={styles.fields}>
        <TextField
          label="Nombre completo"
          ref={fullNameRef}
          name="fullName"
          autoComplete="name"
          placeholder="Ej: Diego Martínez"
          value={state.values.fullName}
          error={state.fieldErrors.fullName}
          onChange={(event) => change('fullName', event.target.value)}
          onBlur={() => blur('fullName')}
        />

        <TextField
          label="Correo electrónico"
          ref={emailRef}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          value={state.values.email}
          error={state.fieldErrors.email}
          onChange={(event) => change('email', event.target.value)}
          onBlur={() => blur('email')}
        />

        <PasswordField
          label="Contraseña"
          ref={passwordRef}
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={state.values.password}
          error={state.fieldErrors.password}
          onChange={(event) => change('password', event.target.value)}
          onBlur={() => blur('password')}
        />

        <PasswordField
          label="Confirmar contraseña"
          ref={confirmPasswordRef}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          value={state.values.confirmPassword}
          error={state.fieldErrors.confirmPassword}
          onChange={(event) => change('confirmPassword', event.target.value)}
          onBlur={() => blur('confirmPassword')}
        />
      </div>

      <Checkbox
        label="Acepto los"
        accessibleName="Acepto los términos y condiciones"
        ref={termsRef}
        checked={state.acceptedTerms}
        onChange={toggleTerms}
        error={state.fieldErrors.acceptedTerms}
        after={
          <Button variant="link" onClick={notAvailable}>
            términos y condiciones
          </Button>
        }
      />

      {state.status === 'unavailable' && (
        <Alert tone="error">{MESSAGES.REGISTER_UNAVAILABLE}</Alert>
      )}

      <Button type="submit" loading={state.status === 'submitting'} loadingLabel="Creando cuenta…">
        Crear cuenta
      </Button>

      <Divider>o regístrate con</Divider>

      <div className={formStyles.social}>
        <SocialButton provider="Google" onClick={comingSoon} />
        <SocialButton provider="Apple" onClick={comingSoon} />
      </div>

      {state.notice && <Alert tone="info">{state.notice}</Alert>}

      <p className={formStyles.footer}>
        ¿Ya tienes cuenta?
        <Button variant="link" onClick={onLogin}>
          Inicia sesión
        </Button>
      </p>
    </form>
  );
}
