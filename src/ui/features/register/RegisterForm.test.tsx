import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RegistrationResult } from '@/domain/auth';
import { MESSAGES } from '@/domain/messages';
import { expectNoA11yViolations } from '@/test/a11y';
import { RegisterForm } from './RegisterForm';

const success: RegistrationResult = {
  kind: 'success',
  displayName: 'Ana Pérez',
  email: 'ana@example.test',
};

function setup(result: RegistrationResult = success) {
  const user = userEvent.setup();
  let release: (() => void) | null = null;
  let deferred = false;
  const register = vi.fn(
    () =>
      new Promise<RegistrationResult>((resolve) => {
        if (deferred) release = () => resolve(result);
        else resolve(result);
      }),
  );
  const onRegistered = vi.fn();
  const onLogin = vi.fn();
  const { container, unmount } = render(
    <RegisterForm register={register} onRegistered={onRegistered} onLogin={onLogin} />,
  );
  const fields = {
    fullName: screen.getByLabelText('Nombre completo'),
    email: screen.getByLabelText('Correo electrónico'),
    password: screen.getByLabelText('Contraseña'),
    confirmPassword: screen.getByLabelText('Confirmar contraseña'),
    terms: screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
  };
  const fillValid = async () => {
    await user.type(fields.fullName, 'Ana Pérez');
    await user.type(fields.email, 'ana@example.test');
    await user.type(fields.password, 'Clavesegura');
    await user.type(fields.confirmPassword, 'Clavesegura');
    await user.click(fields.terms);
  };
  const submit = () => user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  return {
    user,
    container,
    unmount,
    register,
    onRegistered,
    onLogin,
    fields,
    fillValid,
    submit,
    defer: () => {
      deferred = true;
    },
    release: () => release?.(),
  };
}

describe('RegisterForm · US1 Crear una cuenta', () => {
  it('REG-US1-1: datos válidos → register y onRegistered con correo y nombre', async () => {
    const { register, onRegistered, fillValid, submit } = setup();
    await fillValid();
    await submit();
    expect(register).toHaveBeenCalledWith({
      fullName: 'Ana Pérez',
      email: 'ana@example.test',
      password: 'Clavesegura',
      confirmPassword: 'Clavesegura',
      acceptedTerms: true,
    });
    expect(onRegistered).toHaveBeenCalledWith({
      email: 'ana@example.test',
      displayName: 'Ana Pérez',
    });
  });

  it('REG-US1-2: durante la espera el botón está ocupado y no admite reenvíos', async () => {
    const ctx = setup();
    ctx.defer();
    await ctx.fillValid();
    await ctx.submit();
    const busy = screen.getByRole('button', { name: 'Creando cuenta…' });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    await ctx.user.click(ctx.fields.fullName);
    await ctx.user.keyboard('{Enter}');
    expect(ctx.register).toHaveBeenCalledOnce();
    await act(async () => ctx.release());
    expect(ctx.onRegistered).toHaveBeenCalledOnce();
  });

  it('si el formulario se desmonta durante la espera, no notifica el resultado', async () => {
    const ctx = setup();
    ctx.defer();
    await ctx.fillValid();
    await ctx.submit();
    ctx.unmount();
    await act(async () => ctx.release());
    expect(ctx.onRegistered).not.toHaveBeenCalled();
  });

  it('REG-US1-5: Enter en un campo envía el formulario', async () => {
    const { user, register, fillValid, fields } = setup();
    await fillValid();
    await user.click(fields.fullName);
    await user.keyboard('{Enter}');
    expect(register).toHaveBeenCalledOnce();
  });

  it('FR-022: servicio no disponible → alerta sin detalles internos', async () => {
    const { fillValid, submit, onRegistered } = setup({ kind: 'unavailable' });
    await fillValid();
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.REGISTER_UNAVAILABLE);
    expect(onRegistered).not.toHaveBeenCalled();
  });
});

describe('RegisterForm · US2 Validación', () => {
  it('REG-US2-1: enviar vacío muestra los cinco mensajes, no registra y enfoca el nombre', async () => {
    const { register, submit, fields } = setup();
    await submit();
    expect(fields.fullName).toHaveAccessibleDescription(MESSAGES.FULL_NAME_REQUIRED);
    expect(fields.email).toHaveAccessibleDescription(MESSAGES.EMAIL_REQUIRED);
    expect(fields.password).toHaveAccessibleDescription(MESSAGES.NEW_PASSWORD_REQUIRED);
    expect(fields.confirmPassword).toHaveAccessibleDescription(MESSAGES.CONFIRM_PASSWORD_REQUIRED);
    expect(fields.terms).toHaveAccessibleDescription(MESSAGES.TERMS_REQUIRED);
    expect(fields.fullName).toHaveFocus();
    expect(register).not.toHaveBeenCalled();
  });

  it('el foco va al primer campo con error, en el orden del formulario', async () => {
    const { user, submit, fields } = setup();
    await user.type(fields.fullName, 'Ana Pérez');
    await user.type(fields.email, 'ana@example.test');
    await submit();
    expect(fields.password).toHaveFocus();
  });

  it.each([
    ['REG-US2-2', 'fullName', 'Ana2', MESSAGES.FULL_NAME_INVALID],
    ['REG-US2-3', 'email', 'usuario@', MESSAGES.EMAIL_INVALID],
    ['REG-US2-4', 'password', 'Clave12', MESSAGES.PASSWORD_TOO_SHORT],
    ['REG-US2-5', 'password', 'clavesegura', MESSAGES.PASSWORD_WEAK],
  ] as const)(
    '%s: %s inválido (%s) muestra su error al salir del campo',
    async (_id, field, value, message) => {
      const { user, fields } = setup();
      await user.type(fields[field], value);
      await user.tab();
      expect(fields[field]).toHaveAccessibleDescription(message);
      expect(fields[field]).toHaveAttribute('aria-invalid', 'true');
    },
  );

  it('REG-US2-7 / REG-US2-9: la confirmación distinta muestra error y se reevalúa', async () => {
    const { user, fields } = setup();
    await user.type(fields.password, 'Clavesegura');
    await user.type(fields.confirmPassword, 'Clavesegur');
    await user.tab();
    expect(fields.confirmPassword).toHaveAccessibleDescription(MESSAGES.PASSWORDS_MISMATCH);
    await user.clear(fields.password);
    await user.type(fields.password, 'Clavesegur');
    expect(fields.confirmPassword).not.toHaveAttribute('aria-invalid');
  });

  it('REG-US2-10 / FR-018: con errores visibles no hay violaciones de accesibilidad', async () => {
    const { container, submit } = setup();
    await submit();
    await expectNoA11yViolations(container);
  });
});

describe('RegisterForm · US3 Correo existente', () => {
  it('REG-US3-1 / REG-US3-3: error en el correo, foco en el correo y contraseñas vacías', async () => {
    const { fillValid, submit, fields, onRegistered } = setup({ kind: 'email-taken' });
    await fillValid();
    await submit();
    expect(fields.email).toHaveAccessibleDescription(MESSAGES.EMAIL_TAKEN);
    expect(fields.email).toHaveFocus();
    expect(fields.fullName).toHaveValue('Ana Pérez');
    expect(fields.email).toHaveValue('ana@example.test');
    expect(fields.password).toHaveValue('');
    expect(fields.confirmPassword).toHaveValue('');
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('REG-US3-2: editar el correo quita el error', async () => {
    const { user, fillValid, submit, fields } = setup({ kind: 'email-taken' });
    await fillValid();
    await submit();
    await user.type(fields.email, 'x');
    expect(fields.email).not.toHaveAttribute('aria-invalid');
  });
});

describe('RegisterForm · US4 Mostrar u ocultar las contraseñas', () => {
  it('REG-US4-1 / REG-US4-2: cada control cambia solo su campo', async () => {
    const { user, fields } = setup();
    const [first, second] = screen.getAllByRole('button', { name: 'Mostrar contraseña' }) as [
      HTMLElement,
      HTMLElement,
    ];
    await user.click(first);
    expect(fields.password).toHaveAttribute('type', 'text');
    expect(fields.confirmPassword).toHaveAttribute('type', 'password');
    expect(first).toHaveAccessibleName('Ocultar contraseña');
    expect(first).toHaveAttribute('aria-pressed', 'true');
    expect(second).toHaveAttribute('aria-pressed', 'false');
    await user.click(first);
    expect(fields.password).toHaveAttribute('type', 'password');
  });

  it('REG-US4-3: se operan con teclado', async () => {
    const { user, fields } = setup();
    const [, second] = screen.getAllByRole('button', { name: 'Mostrar contraseña' }) as [
      HTMLElement,
      HTMLElement,
    ];
    second.focus();
    await user.keyboard('{Enter}');
    expect(fields.confirmPassword).toHaveAttribute('type', 'text');
  });
});

describe('RegisterForm · US5 Navegación y elementos fuera de alcance', () => {
  it.each(['términos y condiciones', 'Google', 'Apple'])(
    'REG-US5-3: "%s" muestra el aviso y conserva los datos',
    async (name) => {
      const { user, fields, register } = setup();
      await user.type(fields.fullName, 'Ana Pérez');
      await user.click(screen.getByRole('button', { name }));
      expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.FEATURE_UNAVAILABLE);
      expect(fields.fullName).toHaveValue('Ana Pérez');
      expect(fields.terms).not.toBeChecked();
      expect(register).not.toHaveBeenCalled();
    },
  );

  it('REG-US5-2: "Inicia sesión" llama a onLogin', async () => {
    const { user, onLogin } = setup();
    await user.click(screen.getByRole('button', { name: 'Inicia sesión' }));
    expect(onLogin).toHaveBeenCalledOnce();
  });

  it('FR-017: orden de tabulación según contracts/ui-registro.md', async () => {
    const { user, fields } = setup();
    const [showPassword, showConfirm] = screen.getAllByRole('button', {
      name: 'Mostrar contraseña',
    });
    const expected = [
      fields.fullName,
      fields.email,
      fields.password,
      showPassword,
      fields.confirmPassword,
      showConfirm,
      fields.terms,
      screen.getByRole('button', { name: 'términos y condiciones' }),
      screen.getByRole('button', { name: 'Crear cuenta' }),
      screen.getByRole('button', { name: 'Google' }),
      screen.getByRole('button', { name: 'Apple' }),
      screen.getByRole('button', { name: 'Inicia sesión' }),
    ];
    for (const element of expected) {
      await user.tab();
      expect(element).toHaveFocus();
    }
  });

  it('FR-018: sin violaciones de accesibilidad', async () => {
    const { container } = setup();
    await expectNoA11yViolations(container);
  });
});

describe('RegisterForm · seguridad (FR-015)', () => {
  it('las contraseñas no se escriben en la consola ni en el almacenamiento', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method).mockImplementation(() => {}),
    );
    const { fillValid, submit } = setup();
    await fillValid();
    await submit();
    expect(setItem).not.toHaveBeenCalled();
    for (const spy of consoleSpies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
    setItem.mockRestore();
    expect(window.location.href).not.toContain('Clavesegura');
  });
});
