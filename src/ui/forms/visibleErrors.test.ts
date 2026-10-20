import { visibleErrors } from './visibleErrors';

describe('visibleErrors (002 research.md R7)', () => {
  it('FR-008: solo devuelve los errores de campos tocados', () => {
    const errors = { email: 'error de correo', password: 'error de contraseña' };
    expect(visibleErrors(errors, { email: true, password: false })).toEqual({
      email: 'error de correo',
    });
  });

  it('un campo tocado sin error no aparece', () => {
    expect(visibleErrors({}, { email: true })).toEqual({});
  });
});
