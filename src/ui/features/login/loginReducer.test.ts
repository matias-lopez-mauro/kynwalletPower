import {
  createInitialLoginState,
  initialLoginState,
  loginReducer,
  type LoginState,
} from './loginReducer';

const filled: LoginState = {
  ...initialLoginState,
  values: { email: 'ana@example.test', password: 'secreto-123' },
};

describe('loginReducer', () => {
  it('estado inicial: editing con valores vacíos', () => {
    expect(initialLoginState.status).toBe('editing');
    expect(initialLoginState.values).toEqual({ email: '', password: '' });
  });

  it('US1-2: submit válido → submitting', () => {
    expect(loginReducer(filled, { type: 'submit' }).status).toBe('submitting');
  });

  it('FR-008: un segundo submit en submitting se ignora', () => {
    const submitting = loginReducer(filled, { type: 'submit' });
    expect(loginReducer(submitting, { type: 'submit' })).toBe(submitting);
  });

  it('US1-1: success → welcome con el nombre', () => {
    const submitting = loginReducer(filled, { type: 'submit' });
    const next = loginReducer(submitting, {
      type: 'result',
      result: { kind: 'success', displayName: 'Ana' },
    });
    expect(next.status).toBe('welcome');
    expect(next.welcomeName).toBe('Ana');
  });

  it('US1-5: logout → estado inicial', () => {
    const welcome: LoginState = { ...filled, status: 'welcome', welcomeName: 'Ana' };
    expect(loginReducer(welcome, { type: 'logout' })).toEqual(initialLoginState);
  });

  it('change actualiza el valor del campo', () => {
    const next = loginReducer(initialLoginState, { type: 'change', field: 'email', value: 'a' });
    expect(next.values.email).toBe('a');
  });

  it('US2-4: invalid-credentials → authError, conserva el correo y vacía la contraseña', () => {
    const submitting = loginReducer(filled, { type: 'submit' });
    const next = loginReducer(submitting, {
      type: 'result',
      result: { kind: 'invalid-credentials' },
    });
    expect(next.status).toBe('authError');
    expect(next.authError).toBe('invalid-credentials');
    expect(next.values).toEqual({ email: 'ana@example.test', password: '' });
  });

  it('FR-019: unavailable → authError unavailable', () => {
    const submitting = loginReducer(filled, { type: 'submit' });
    const next = loginReducer(submitting, { type: 'result', result: { kind: 'unavailable' } });
    expect(next.status).toBe('authError');
    expect(next.authError).toBe('unavailable');
  });

  it('US2-3: editar un campo en authError → editing sin mensaje', () => {
    const failed: LoginState = { ...filled, status: 'authError', authError: 'invalid-credentials' };
    const next = loginReducer(failed, { type: 'change', field: 'password', value: 'x' });
    expect(next.status).toBe('editing');
    expect(next.authError).toBeNull();
  });

  it('FR-005: blur marca el campo como tocado y calcula su error', () => {
    const next = loginReducer(initialLoginState, { type: 'blur', field: 'email' });
    expect(next.touched.email).toBe(true);
    expect(next.fieldErrors.email).toBe('Ingresa tu correo electrónico');
    expect(next.fieldErrors.password).toBeUndefined();
  });

  it('FR-006: submit con errores marca todo, sigue en editing y no pasa a submitting', () => {
    const next = loginReducer(initialLoginState, { type: 'submit' });
    expect(next.status).toBe('editing');
    expect(next.touched).toEqual({ email: true, password: true });
    expect(next.fieldErrors).toEqual({
      email: 'Ingresa tu correo electrónico',
      password: 'Ingresa tu contraseña',
    });
  });

  it('FR-005: change en un campo tocado recalcula y oculta el error si es válido', () => {
    const touched = loginReducer(initialLoginState, { type: 'blur', field: 'email' });
    const next = loginReducer(touched, { type: 'change', field: 'email', value: 'a@b.co' });
    expect(next.fieldErrors.email).toBeUndefined();
  });

  it('change en un campo no tocado no muestra errores todavía', () => {
    const next = loginReducer(initialLoginState, { type: 'change', field: 'email', value: 'a' });
    expect(next.fieldErrors.email).toBeUndefined();
  });

  it('FR-017: toggleRemember cambia rememberMe', () => {
    expect(
      loginReducer(initialLoginState, { type: 'toggleRemember', checked: true }).rememberMe,
    ).toBe(true);
  });

  it('FR-016: showNotice guarda el aviso y submit lo limpia', () => {
    const noticed = loginReducer(filled, { type: 'showNotice', message: 'Aviso' });
    expect(noticed.notice).toBe('Aviso');
    expect(loginReducer(noticed, { type: 'submit' }).notice).toBeNull();
  });
});

describe('loginReducer · vuelta desde el registro (002 FR-014)', () => {
  const fromRegistration = createInitialLoginState({
    email: 'ana@example.test',
    registeredNotice: '¡Listo, Ana! Tu cuenta fue creada. Inicia sesión con tu contraseña.',
  });

  it('sin argumentos equivale al estado inicial de 001', () => {
    expect(createInitialLoginState()).toEqual(initialLoginState);
    expect(initialLoginState.registeredNotice).toBeNull();
  });

  it('REG-US1-1: precarga el correo y el aviso, con la contraseña vacía', () => {
    expect(fromRegistration.values).toEqual({ email: 'ana@example.test', password: '' });
    expect(fromRegistration.registeredNotice).toMatch(/Tu cuenta fue creada/);
  });

  it('FR-014b: editar un campo limpia el aviso', () => {
    const next = loginReducer(fromRegistration, {
      type: 'change',
      field: 'password',
      value: 'C',
    });
    expect(next.registeredNotice).toBeNull();
  });

  it('FR-014b: enviar limpia el aviso', () => {
    expect(loginReducer(fromRegistration, { type: 'submit' }).registeredNotice).toBeNull();
  });

  it('logout vuelve al estado vacío, sin el correo precargado', () => {
    expect(loginReducer(fromRegistration, { type: 'logout' })).toEqual(initialLoginState);
  });
});
