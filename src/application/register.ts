import type { RegistrationRequest, RegistrationResult } from '@/domain/auth';
import { normalizeEmail, normalizeFullName } from '@/domain/validation';
import type { RegistrationGateway } from './ports/RegistrationGateway';

export type Register = (request: RegistrationRequest) => Promise<RegistrationResult>;

/** Caso de uso: crea una cuenta delegando en el puerto de registro. */
export function createRegister(gateway: RegistrationGateway): Register {
  return async ({ fullName, email, password }) => {
    try {
      return await gateway.register({
        fullName: normalizeFullName(fullName),
        email: normalizeEmail(email),
        password,
      });
    } catch {
      return { kind: 'unavailable' };
    }
  };
}
