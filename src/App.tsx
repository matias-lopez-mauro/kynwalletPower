import { useState } from 'react';
import type { Authenticate } from '@/application/authenticate';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { LoginForm } from '@/ui/features/login/LoginForm';
import { LoginScreen } from '@/ui/features/login/LoginScreen';
import { REGISTER_BRAND, RegisterForm } from '@/ui/features/register/RegisterForm';

type AppProps = {
  authenticate: Authenticate;
  register: Register;
};

/** Navegación mínima entre login y registro, sin router (002 research.md R6). */
type Route =
  { screen: 'login'; prefill?: { email: string; notice: string } } | { screen: 'register' };

export function App({ authenticate, register }: AppProps) {
  const [route, setRoute] = useState<Route>({ screen: 'login' });
  // Cada navegación monta un formulario nuevo: ningún dato pasa de una pantalla a otra (FR-014b).
  const [visit, setVisit] = useState(0);
  const navigate = (next: Route) => {
    setRoute(next);
    setVisit((current) => current + 1);
  };

  if (route.screen === 'register') {
    return (
      <LoginScreen {...REGISTER_BRAND}>
        <RegisterForm
          key={visit}
          register={register}
          onLogin={() => navigate({ screen: 'login' })}
          onRegistered={({ email, displayName }) =>
            navigate({
              screen: 'login',
              prefill: { email, notice: MESSAGES.registered(displayName) },
            })
          }
        />
      </LoginScreen>
    );
  }

  return (
    <LoginScreen>
      <LoginForm
        key={visit}
        authenticate={authenticate}
        onRegister={() => navigate({ screen: 'register' })}
        initialEmail={route.prefill?.email}
        registeredNotice={route.prefill?.notice}
      />
    </LoginScreen>
  );
}
