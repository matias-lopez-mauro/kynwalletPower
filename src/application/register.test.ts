import type { RegistrationGateway } from './ports/RegistrationGateway';
import { createRegister } from './register';

const request = {
  fullName: '  Ana   Pérez ',
  email: '  Ana@Example.TEST ',
  password: ' Clave segura1 ',
  confirmPassword: ' Clave segura1 ',
  acceptedTerms: true,
};

describe('createRegister (contracts/registration-gateway.md)', () => {
  it('U1: delega nombre y correo normalizados y la contraseña sin modificar', async () => {
    const success = { kind: 'success', displayName: 'Ana Pérez', email: 'ana@example.test' };
    const gateway: RegistrationGateway = { register: vi.fn().mockResolvedValue(success) };
    await expect(createRegister(gateway)(request)).resolves.toEqual(success);
    // Ni la confirmación ni la aceptación de términos llegan al puerto (minimización, 5.4).
    expect(gateway.register).toHaveBeenCalledWith({
      fullName: 'Ana Pérez',
      email: 'ana@example.test',
      password: ' Clave segura1 ',
    });
  });

  it('U2: si el gateway lanza una excepción devuelve unavailable', async () => {
    const gateway: RegistrationGateway = { register: vi.fn().mockRejectedValue(new Error('x')) };
    await expect(createRegister(gateway)(request)).resolves.toEqual({ kind: 'unavailable' });
  });
});
