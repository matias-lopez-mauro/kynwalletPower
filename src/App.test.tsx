import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAuthenticate } from '@/application/authenticate';
import { createRegister } from '@/application/register';
import type { DemoAccount } from '@/domain/auth';
import { MESSAGES } from '@/domain/messages';
import { InMemoryAccountStore } from '@/infrastructure/InMemoryAccountStore';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { InMemoryRegistrationGateway } from '@/infrastructure/InMemoryRegistrationGateway';
import { expectNoA11yViolations } from '@/test/a11y';
import { TEST_ACCOUNT } from '@/test/fixtures';
import { App } from './App';

/** Composición real con los adaptadores en memoria y sin espera (como en main.tsx). */
function renderApp(accounts: DemoAccount[] | null = [TEST_ACCOUNT]) {
  const store = new InMemoryAccountStore(accounts);
  const authenticate = createAuthenticate(new InMemoryAuthGateway(store, { delayMs: 0 }));
  const register = createRegister(new InMemoryRegistrationGateway(store, { delayMs: 0 }));
  const user = userEvent.setup();
  const view = render(<App authenticate={authenticate} register={register} />);
  return { user, ...view };
}

async function fillRegistration(
  user: ReturnType<typeof userEvent.setup>,
  { fullName = 'Ana Pérez', email = 'ana@example.test', password = 'Clavesegura' } = {},
) {
  await user.type(screen.getByLabelText('Nombre completo'), fullName);
  await user.type(screen.getByLabelText('Correo electrónico'), email);
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.type(screen.getByLabelText('Confirmar contraseña'), password);
  await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
}

describe('App · accesibilidad de la pantalla completa (FR-015, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { container } = renderApp();
    await expectNoA11yViolations(container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    const { user, container } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await user.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { user, container } = renderApp();
    await user.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await user.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(container);
  });

  it('002 SC-006: vista de registro y vuelta al login sin violaciones', async () => {
    const { user, container } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await expectNoA11yViolations(container);
    await fillRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await screen.findByRole('heading', { name: 'Bienvenido de nuevo' });
    await expectNoA11yViolations(container);
  });
});

describe('App · registro de punta a punta (002)', () => {
  it('REG-US5-1 / FR-019: "Regístrate" abre el registro con los campos vacíos', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByText(/Comienza tu/)).toHaveTextContent('Comienza tucamino financiero.');
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
  });

  it('REG-US1-1 / REG-US1-4 / FR-014: vuelve al login con el correo normalizado y el aviso', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await fillRegistration(user, { fullName: '  Ana   Pérez ', email: 'Ana@Example.TEST' });
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('ana@example.test');
    const password = screen.getByLabelText('Contraseña');
    expect(password).toHaveValue('');
    expect(password).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.registered('Ana Pérez'));
  });

  it('REG-US1-3 / FR-014a / SC-004: solo la contraseña creada da acceso', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await fillRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    const password = await screen.findByLabelText('Contraseña');

    await user.type(password, 'Otraclave1');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.INVALID_CREDENTIALS);

    await user.type(screen.getByLabelText('Contraseña'), 'Clavesegura');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(
      await screen.findByRole('heading', { name: '¡Bienvenido, Ana Pérez!' }),
    ).toBeInTheDocument();
  });

  it('REG-US3-1: un correo de demostración no puede registrarse de nuevo', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await fillRegistration(user, { email: TEST_ACCOUNT.email.toUpperCase() });
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText(MESSAGES.EMAIL_TAKEN)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
  });

  it('REG-US5-2: "Inicia sesión" vuelve al login vacío y el registro no conserva datos', async () => {
    const { user } = renderApp();
    await user.type(screen.getByLabelText('Correo electrónico'), 'escrito@example.test');
    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await fillRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Inicia sesión' }));

    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
  });

  it('FR-022: sin configuración de cuentas el registro informa que no está disponible', async () => {
    const { user } = renderApp(null);
    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await fillRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.REGISTER_UNAVAILABLE);
  });
});
