import type { DemoAccount } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';

/**
 * Cuentas de demostración más las creadas en la sesión, compartidas por los gateways en memoria
 * (research.md R3). Nada se persiste: al recargar la página se pierden las cuentas nuevas.
 */
export class InMemoryAccountStore {
  private readonly accounts: DemoAccount[] | null;

  /** `null` representa una configuración ausente o inválida: el servicio no está disponible. */
  constructor(accounts: readonly DemoAccount[] | null) {
    this.accounts = accounts ? [...accounts] : null;
  }

  isAvailable(): boolean {
    return this.accounts !== null;
  }

  findByEmail(email: string): DemoAccount | undefined {
    const normalized = normalizeEmail(email);
    return this.accounts?.find((candidate) => normalizeEmail(candidate.email) === normalized);
  }

  /** Comprueba y agrega en un único paso síncrono, sin sobrescribir cuentas existentes. */
  add(account: DemoAccount): 'added' | 'email-taken' {
    if (!this.accounts) throw new Error('Account store unavailable');
    if (this.findByEmail(account.email)) return 'email-taken';
    this.accounts.push({ ...account, email: normalizeEmail(account.email) });
    return 'added';
  }
}
