import { MESSAGES } from './messages';
import type { RegistrationRequest } from './auth';
import {
  normalizeEmail,
  normalizeFullName,
  validateCredentials,
  validateRegistration,
} from './validation';

describe('normalizeEmail', () => {
  it('US1-3: recorta espacios periféricos y convierte a minúsculas', () => {
    expect(normalizeEmail('  Demo@Example.COM ')).toBe('demo@example.com');
  });

  it('no altera el contenido interior', () => {
    expect(normalizeEmail('a.b+c@d.com')).toBe('a.b+c@d.com');
  });
});

describe('validateCredentials (data-model.md)', () => {
  const valid = { email: 'ana@example.test', password: 'secreto-123' };

  it('credenciales válidas → {}', () => {
    expect(validateCredentials(valid)).toEqual({});
  });

  it.each(['', '   '])('correo vacío tras trim (%j) → EMAIL_REQUIRED', (email) => {
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_REQUIRED);
  });

  it.each(['usuario@', 'usuario.com', 'a@b.c', 'a b@c.com'])(
    'US3-2: correo sin formato válido (%s) → EMAIL_INVALID',
    (email) => {
      expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
    },
  );

  it('correo de > 254 caracteres → EMAIL_INVALID', () => {
    const email = `${'a'.repeat(245)}@example.test`;
    expect(email.length).toBeGreaterThan(254);
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
  });

  it('acepta el correo con espacios periféricos', () => {
    expect(validateCredentials({ ...valid, email: '  Ana@Example.test ' })).toEqual({});
  });

  it('contraseña vacía → PASSWORD_REQUIRED', () => {
    expect(validateCredentials({ ...valid, password: '' }).password).toBe(
      MESSAGES.PASSWORD_REQUIRED,
    );
  });

  it('US3-3: contraseña de < 8 caracteres → PASSWORD_TOO_SHORT', () => {
    expect(validateCredentials({ ...valid, password: '1234567' }).password).toBe(
      MESSAGES.PASSWORD_TOO_SHORT,
    );
  });

  it('contraseña de > 128 caracteres → PASSWORD_TOO_LONG', () => {
    expect(validateCredentials({ ...valid, password: 'x'.repeat(129) }).password).toBe(
      MESSAGES.PASSWORD_TOO_LONG,
    );
  });

  it('la contraseña no se recorta: 7 caracteres + espacios cuenta los espacios', () => {
    expect(validateCredentials({ ...valid, password: ' 123456 ' })).toEqual({});
    expect(validateCredentials({ ...valid, password: '        ' })).toEqual({});
  });
});

describe('normalizeFullName (002)', () => {
  it('REG-US1: recorta los espacios periféricos y colapsa los internos', () => {
    expect(normalizeFullName('  Ana   Pérez ')).toBe('Ana Pérez');
  });
});

describe('validateCredentials · login sin reglas de fortaleza (002 FR-005b)', () => {
  it('FR-005b: "clavesegura" sigue siendo válida en el login', () => {
    expect(validateCredentials({ email: 'ana@example.test', password: 'clavesegura' })).toEqual({});
  });
});

describe('validateRegistration (002 data-model.md)', () => {
  const request: RegistrationRequest = {
    fullName: 'Ana Pérez',
    email: 'ana@example.test',
    password: 'Clavesegura',
    confirmPassword: 'Clavesegura',
    acceptedTerms: true,
  };
  const withPassword = (password: string) => ({ ...request, password, confirmPassword: password });

  it('solicitud válida → {}', () => {
    expect(validateRegistration(request)).toEqual({});
  });

  it('REG-US2-1: todo vacío → un mensaje por campo', () => {
    expect(
      validateRegistration({
        fullName: ' ',
        email: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false,
      }),
    ).toEqual({
      fullName: MESSAGES.FULL_NAME_REQUIRED,
      email: MESSAGES.EMAIL_REQUIRED,
      password: MESSAGES.NEW_PASSWORD_REQUIRED,
      confirmPassword: MESSAGES.CONFIRM_PASSWORD_REQUIRED,
      acceptedTerms: MESSAGES.TERMS_REQUIRED,
    });
  });

  it.each(['A', 'Ana2', 'Ana@', '--', 'Ana  -Pérez', 'x'.repeat(101)])(
    'REG-US2-2: nombre inválido (%s) → FULL_NAME_INVALID',
    (fullName) => {
      expect(validateRegistration({ ...request, fullName }).fullName).toBe(
        MESSAGES.FULL_NAME_INVALID,
      );
    },
  );

  it.each(['Ana', "María José O'Neill-Peña", 'Ñandú Ávila', 'Ana O’Neil', '  Ana   Pérez '])(
    'FR-003: nombre válido (%s)',
    (fullName) => {
      expect(validateRegistration({ ...request, fullName }).fullName).toBeUndefined();
    },
  );

  it('FR-003: acepta un nombre de 100 letras', () => {
    expect(validateRegistration({ ...request, fullName: 'a'.repeat(100) })).toEqual({});
  });

  it.each(['usuario@', 'usuario.com'])('REG-US2-3: correo inválido (%s)', (email) => {
    expect(validateRegistration({ ...request, email }).email).toBe(MESSAGES.EMAIL_INVALID);
  });

  it('REG-US2-4: contraseña de 7 caracteres → PASSWORD_TOO_SHORT', () => {
    expect(validateRegistration(withPassword('Clave12')).password).toBe(
      MESSAGES.PASSWORD_TOO_SHORT,
    );
  });

  it('FR-005: contraseña de 129 caracteres → PASSWORD_TOO_LONG', () => {
    expect(validateRegistration(withPassword('A'.repeat(129))).password).toBe(
      MESSAGES.PASSWORD_TOO_LONG,
    );
  });

  it.each(['clavesegura', 'clave segura', 'contraseñaaa'])(
    'REG-US2-5: sin mayúscula, número ni símbolo (%s) → PASSWORD_WEAK',
    (password) => {
      expect(validateRegistration(withPassword(password)).password).toBe(MESSAGES.PASSWORD_WEAK);
    },
  );

  it.each(['Clavesegura', 'clavesegura1', 'clave-segura', 'claveseguraÑ'])(
    'REG-US2-6: con mayúscula, número o símbolo (%s) → válida',
    (password) => {
      expect(validateRegistration(withPassword(password))).toEqual({});
    },
  );

  it('la contraseña no se recorta: los espacios cuentan para la longitud', () => {
    expect(validateRegistration(withPassword(' Clave1 ')).password).toBeUndefined();
  });

  it.each([
    ['distinta', 'Otraclave'],
    ['con espacios', ' Clavesegura'],
    ['con otras mayúsculas', 'clavesegura'],
  ])('REG-US2-7: confirmación %s → PASSWORDS_MISMATCH', (_label, confirmPassword) => {
    expect(validateRegistration({ ...request, confirmPassword }).confirmPassword).toBe(
      MESSAGES.PASSWORDS_MISMATCH,
    );
  });

  it('REG-US2-8: términos sin aceptar → TERMS_REQUIRED', () => {
    expect(validateRegistration({ ...request, acceptedTerms: false })).toEqual({
      acceptedTerms: MESSAGES.TERMS_REQUIRED,
    });
  });
});
