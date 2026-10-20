import { useEffect, useRef, type FormEvent } from 'react';
import type { Authenticate } from '@/application/authenticate';
import { MESSAGES } from '@/domain/messages';
import { Alert } from '@/ui/components/Alert/Alert';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Divider } from '@/ui/components/Divider/Divider';
import { PasswordField } from '@/ui/components/PasswordField/PasswordField';
import { SocialButton } from '@/ui/components/SocialButton/SocialButton';
import { TextField } from '@/ui/components/TextField/TextField';
import { useLoginForm } from './useLoginForm';
import { WelcomeView } from './WelcomeView';
import formStyles from '@/ui/forms/authForm.module.css';
import styles from './LoginForm.module.css';

type LoginFormProps = {
  authenticate: Authenticate;
  /** Abre la pantalla de registro (002 FR-019). */
  onRegister: () => void;
  /** Correo recién registrado, precargado al volver del registro (002 FR-014). */
  initialEmail?: string;
  registeredNotice?: string;
};

export function LoginForm({
  authenticate,
  onRegister,
  initialEmail,
  registeredNotice,
}: LoginFormProps) {
  const { state, change, blur, submit, logout, toggleRemember, showNotice } = useLoginForm(
    authenticate,
    { email: initialEmail, registeredNotice },
  );
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // 002 FR-014: al volver del registro, el usuario ingresa la contraseña que acaba de crear.
  useEffect(() => {
    if (initialEmail) passwordRef.current?.focus();
  }, [initialEmail]);

  // US2-4: tras credenciales incorrectas, el foco vuelve a la contraseña.
  useEffect(() => {
    if (state.authError === 'invalid-credentials') passwordRef.current?.focus();
  }, [state.authError]);

  if (state.status === 'welcome' && state.welcomeName) {
    return <WelcomeView name={state.welcomeName} onLogout={logout} />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = submit();
    // US3-1: el foco va al primer campo con error.
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
  };

  // FR-016: elementos del diseño fuera del alcance de la demostración.
  const notAvailable = () => showNotice(MESSAGES.FEATURE_UNAVAILABLE);

  return (
    <form className={formStyles.form} noValidate onSubmit={handleSubmit}>
      <div className={formStyles.heading}>
        <h1 className={formStyles.title}>Bienvenido de nuevo</h1>
        <p className={formStyles.subtitle}>Ingresa a tu cuenta para continuar</p>
      </div>

      {state.registeredNotice && <Alert tone="info">{state.registeredNotice}</Alert>}

      <TextField
        label="Correo electrónico"
        ref={emailRef}
        type="email"
        name="email"
        autoComplete="username"
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
        autoComplete="current-password"
        placeholder="••••••••"
        value={state.values.password}
        error={state.fieldErrors.password}
        onChange={(event) => change('password', event.target.value)}
        onBlur={() => blur('password')}
      />

      <div className={styles.options}>
        <Checkbox label="Recordarme" checked={state.rememberMe} onChange={toggleRemember} />
        <Button variant="link" onClick={notAvailable}>
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {state.authError && (
        <Alert tone="error">
          {state.authError === 'invalid-credentials'
            ? MESSAGES.INVALID_CREDENTIALS
            : MESSAGES.UNAVAILABLE}
        </Alert>
      )}

      <Button
        type="submit"
        loading={state.status === 'submitting'}
        loadingLabel="Iniciando sesión…"
      >
        Iniciar sesión
      </Button>

      <Divider>o continúa con</Divider>

      <div className={formStyles.social}>
        <SocialButton provider="Google" onClick={notAvailable} />
        <SocialButton provider="Apple" onClick={notAvailable} />
      </div>

      {state.notice && <Alert tone="info">{state.notice}</Alert>}

      <p className={formStyles.footer}>
        ¿No tienes cuenta?
        <Button variant="link" onClick={onRegister}>
          Regístrate
        </Button>
      </p>
    </form>
  );
}
