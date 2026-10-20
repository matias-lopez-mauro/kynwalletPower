import type { RegistrationGateway } from '@/application/ports/RegistrationGateway';
import type { NewAccount, RegistrationResult } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';
import type { InMemoryAccountStore } from './InMemoryAccountStore';
import { wait } from './wait';

const DEFAULT_DELAY_MS = 1000;

/** Registro simulado en memoria (contracts/registration-gateway.md, research.md R5). */
export class InMemoryRegistrationGateway implements RegistrationGateway {
  private readonly store: InMemoryAccountStore;
  private readonly delayMs: number;

  constructor(store: InMemoryAccountStore, options: { delayMs?: number } = {}) {
    this.store = store;
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  }

  async register(account: NewAccount): Promise<RegistrationResult> {
    await wait(this.delayMs);
    try {
      if (!this.store.isAvailable()) return { kind: 'unavailable' };
      const outcome = this.store.add({
        email: account.email,
        password: account.password,
        displayName: account.fullName,
      });
      if (outcome === 'email-taken') return { kind: 'email-taken' };
      return {
        kind: 'success',
        displayName: account.fullName,
        email: normalizeEmail(account.email),
      };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
