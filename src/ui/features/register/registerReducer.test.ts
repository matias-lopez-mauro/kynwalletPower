import { MESSAGES } from '@/domain/messages';
import { initialRegisterState, registerReducer, type RegisterState } from './registerReducer';

const filled: RegisterState = {
  ...initialRegisterState,
  values: {
    fullName: 'Ana Pérez',
    email: 'ana@example.test',
    password: 'Clavesegura',
    confirmPassword: 'Clavesegura',
  },
  acceptedTerms: true,
};

describe('registerReducer · envío (002 US1)', () => {
  it('estado inicial: editing con todo vacío y términos sin aceptar', () => {
    expect(initialRegisterState.status).toBe('editing');
    expect(initialRegisterState.values).toEqual({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(initialRegisterState.acceptedTerms).toBe(false);
  });

  it('change actualiza el valor del campo', () => {
    const next = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'fullName',
      value: 'Ana',
    });
    expect(next.values.fullName).toBe('Ana');
  });

  it('REG-US1-2: submit válido → submitting; un segundo submit se ignora (FR-011)', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    expect(submitting.status).toBe('submitting');
    expect(registerReducer(submitting, { type: 'submit' })).toBe(submitting);
  });

  it('FR-022: result unavailable → unavailable; editar vuelve a editing', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    const unavailable = registerReducer(submitting, {
      type: 'result',
      result: { kind: 'unavailable' },
    });
    expect(unavailable.status).toBe('unavailable');
    const edited = registerReducer(unavailable, { type: 'change', field: 'fullName', value: 'A' });
    expect(edited.status).toBe('editing');
  });

  it('result success no cambia el estado (el formulario se desmonta)', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    const next = registerReducer(submitting, {
      type: 'result',
      result: { kind: 'success', displayName: 'Ana Pérez', email: 'ana@example.test' },
    });
    expect(next).toBe(submitting);
  });
});

describe('registerReducer · validación (002 US2)', () => {
  it('FR-008: los errores solo se ven en campos tocados', () => {
    const next = registerReducer(initialRegisterState, { type: 'blur', field: 'email' });
    expect(next.fieldErrors).toEqual({ email: MESSAGES.EMAIL_REQUIRED });
  });

  it('REG-US2-1 / FR-009: submit con errores marca todo y no pasa a submitting', () => {
    const next = registerReducer(initialRegisterState, { type: 'submit' });
    expect(next.status).toBe('editing');
    expect(Object.keys(next.fieldErrors)).toEqual([
      'fullName',
      'email',
      'password',
      'confirmPassword',
      'acceptedTerms',
    ]);
  });

  it('REG-US2-9: editar la contraseña revalida la confirmación tocada', () => {
    const touched = registerReducer(filled, { type: 'blur', field: 'confirmPassword' });
    const next = registerReducer(touched, { type: 'change', field: 'password', value: 'Otra1234' });
    expect(next.fieldErrors.confirmPassword).toBe(MESSAGES.PASSWORDS_MISMATCH);
    const fixed = registerReducer(next, {
      type: 'change',
      field: 'confirmPassword',
      value: 'Otra1234',
    });
    expect(fixed.fieldErrors.confirmPassword).toBeUndefined();
  });

  it('REG-US2-8: desmarcar los términos muestra el error', () => {
    const next = registerReducer(filled, { type: 'toggleTerms', checked: false });
    expect(next.fieldErrors.acceptedTerms).toBe(MESSAGES.TERMS_REQUIRED);
  });
});

describe('registerReducer · correo existente (002 US3)', () => {
  const taken = registerReducer(registerReducer(filled, { type: 'submit' }), {
    type: 'result',
    result: { kind: 'email-taken' },
  });

  it('REG-US3-1 / REG-US3-3: error en el correo, contraseñas vacías, nombre y correo conservados', () => {
    expect(taken.status).toBe('editing');
    expect(taken.fieldErrors).toEqual({ email: MESSAGES.EMAIL_TAKEN });
    expect(taken.values).toEqual({
      fullName: 'Ana Pérez',
      email: 'ana@example.test',
      password: '',
      confirmPassword: '',
    });
  });

  it('editar otro campo conserva el error del correo', () => {
    const next = registerReducer(taken, { type: 'change', field: 'password', value: 'C' });
    expect(next.fieldErrors.email).toBe(MESSAGES.EMAIL_TAKEN);
  });

  it('REG-US3-2: editar el correo quita el error', () => {
    const next = registerReducer(taken, {
      type: 'change',
      field: 'email',
      value: 'ana2@example.test',
    });
    expect(next.fieldErrors.email).toBeUndefined();
  });
});

describe('registerReducer · avisos (002 US5)', () => {
  it('FR-020: showNotice muestra el aviso y submit lo limpia', () => {
    const shown = registerReducer(filled, {
      type: 'showNotice',
      message: MESSAGES.FEATURE_UNAVAILABLE,
    });
    expect(shown.notice).toBe(MESSAGES.FEATURE_UNAVAILABLE);
    expect(shown.values).toEqual(filled.values);
    expect(registerReducer(shown, { type: 'submit' }).notice).toBeNull();
  });
});
