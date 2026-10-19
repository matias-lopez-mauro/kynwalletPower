import { TEST_ACCOUNT } from '@/test/fixtures';
import { InMemoryAccountStore } from './InMemoryAccountStore';

const newAccount = {
  email: 'ana.perez@example.test',
  password: 'Fixture-pass-02',
  displayName: 'Ana Pérez',
};

describe('InMemoryAccountStore (data-model.md)', () => {
  it('con configuración null no está disponible', () => {
    expect(new InMemoryAccountStore(null).isAvailable()).toBe(false);
  });

  it('con cuentas está disponible', () => {
    expect(new InMemoryAccountStore([TEST_ACCOUNT]).isAvailable()).toBe(true);
  });

  it('findByEmail compara por correo normalizado', () => {
    const store = new InMemoryAccountStore([TEST_ACCOUNT]);
    expect(store.findByEmail(`  ${TEST_ACCOUNT.email.toUpperCase()} `)).toEqual(TEST_ACCOUNT);
    expect(store.findByEmail('otro@example.test')).toBeUndefined();
  });

  it('add agrega una cuenta nueva con el correo normalizado', () => {
    const store = new InMemoryAccountStore([TEST_ACCOUNT]);
    expect(store.add({ ...newAccount, email: ' Ana.Perez@Example.TEST ' })).toBe('added');
    expect(store.findByEmail(newAccount.email)).toEqual(newAccount);
  });

  it('FR-012: add con un correo existente devuelve email-taken y no sobrescribe', () => {
    const store = new InMemoryAccountStore([TEST_ACCOUNT]);
    const duplicate = { ...newAccount, email: ` ${TEST_ACCOUNT.email.toUpperCase()}` };
    expect(store.add(duplicate)).toBe('email-taken');
    expect(store.findByEmail(TEST_ACCOUNT.email)).toEqual(TEST_ACCOUNT);
  });

  it('add sin configuración lanza un error (el gateway lo convierte en unavailable)', () => {
    expect(() => new InMemoryAccountStore(null).add(newAccount)).toThrow();
  });

  it('no modifica el arreglo recibido', () => {
    const accounts = [TEST_ACCOUNT];
    new InMemoryAccountStore(accounts).add(newAccount);
    expect(accounts).toEqual([TEST_ACCOUNT]);
  });
});
