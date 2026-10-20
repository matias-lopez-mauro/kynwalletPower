import { TEST_ACCOUNT } from '@/test/fixtures';
import { InMemoryAccountStore } from './InMemoryAccountStore';
import { InMemoryAuthGateway } from './InMemoryAuthGateway';
import { InMemoryRegistrationGateway } from './InMemoryRegistrationGateway';

const newAccount = {
  fullName: 'Ana Pérez',
  email: 'ana.perez@example.test',
  password: 'Fixture-pass-02',
};

function setup(accounts: ConstructorParameters<typeof InMemoryAccountStore>[0] = [TEST_ACCOUNT]) {
  const store = new InMemoryAccountStore(accounts);
  return {
    registration: new InMemoryRegistrationGateway(store, { delayMs: 0 }),
    auth: new InMemoryAuthGateway(store, { delayMs: 0 }),
  };
}

describe('InMemoryRegistrationGateway (contracts/registration-gateway.md)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('R1: correo nuevo → success, y la cuenta puede iniciar sesión (FR-013, SC-004)', async () => {
    const { registration, auth } = setup();
    await expect(registration.register(newAccount)).resolves.toEqual({
      kind: 'success',
      displayName: 'Ana Pérez',
      email: 'ana.perez@example.test',
    });
    await expect(
      auth.authenticate({ email: newAccount.email, password: newAccount.password }),
    ).resolves.toEqual({ kind: 'success', displayName: 'Ana Pérez' });
  });

  it.each([
    ['de demostración', TEST_ACCOUNT.email.toUpperCase()],
    ['con espacios periféricos', `  ${TEST_ACCOUNT.email} `],
  ])('R2: correo %s ya registrado → email-taken (FR-012)', async (_label, email) => {
    const { registration, auth } = setup();
    await expect(registration.register({ ...newAccount, email })).resolves.toEqual({
      kind: 'email-taken',
    });
    // El almacén no cambia: la cuenta original conserva su contraseña.
    await expect(
      auth.authenticate({ email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password }),
    ).resolves.toEqual({ kind: 'success', displayName: TEST_ACCOUNT.displayName });
  });

  it('R2: un correo creado en la sesión tampoco puede registrarse de nuevo', async () => {
    const { registration } = setup();
    await registration.register(newAccount);
    await expect(
      registration.register({ ...newAccount, email: 'ANA.PEREZ@example.test' }),
    ).resolves.toEqual({ kind: 'email-taken' });
  });

  it('R3: almacén no disponible → unavailable', async () => {
    await expect(setup(null).registration.register(newAccount)).resolves.toEqual({
      kind: 'unavailable',
    });
  });

  it('R4: una excepción interna → unavailable sin rechazar la promesa', async () => {
    const broken = [
      {
        get email(): string {
          throw new Error('boom');
        },
        password: 'x',
        displayName: 'x',
      },
    ];
    await expect(setup(broken).registration.register(newAccount)).resolves.toEqual({
      kind: 'unavailable',
    });
  });

  it('R5: el resultado nunca contiene la contraseña', async () => {
    const result = await setup().registration.register(newAccount);
    expect(JSON.stringify(result)).not.toContain(newAccount.password);
  });

  it('FR-011: espera delayMs antes de responder (1000 ms por defecto)', async () => {
    vi.useFakeTimers();
    const onResolve = vi.fn();
    new InMemoryRegistrationGateway(new InMemoryAccountStore([TEST_ACCOUNT]))
      .register(newAccount)
      .then(onResolve);
    await vi.advanceTimersByTimeAsync(999);
    expect(onResolve).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onResolve).toHaveBeenCalledOnce();
  });
});
