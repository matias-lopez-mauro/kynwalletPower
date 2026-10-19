import type { NewAccount, RegistrationResult } from '@/domain/auth';

/** Puerto de registro (contracts/registration-gateway.md). */
export interface RegistrationGateway {
  register(account: NewAccount): Promise<RegistrationResult>;
}
