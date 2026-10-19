import type { AuthGateway } from '@/application/ports/AuthGateway';
import type { AuthResult, LoginCredentials } from '@/domain/auth';
import type { InMemoryAccountStore } from './InMemoryAccountStore';
import { wait } from './wait';

const DEFAULT_DELAY_MS = 1000;

/** Autenticación simulada en memoria (contracts/auth-gateway.md, research.md R5). */
export class InMemoryAuthGateway implements AuthGateway {
  private readonly store: InMemoryAccountStore;
  private readonly delayMs: number;

  constructor(store: InMemoryAccountStore, options: { delayMs?: number } = {}) {
    this.store = store;
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    await wait(this.delayMs);
    try {
      if (!this.store.isAvailable()) return { kind: 'unavailable' };
      const account = this.store.findByEmail(credentials.email);
      // Correo inexistente y contraseña incorrecta producen el mismo resultado (FR-010).
      if (!account || account.password !== credentials.password) {
        return { kind: 'invalid-credentials' };
      }
      return { kind: 'success', displayName: account.displayName };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
