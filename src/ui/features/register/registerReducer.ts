import type { RegistrationResult } from '@/domain/auth';
import { MESSAGES } from '@/domain/messages';
import { validateRegistration, type RegistrationErrors } from '@/domain/validation';
import { visibleErrors } from '@/ui/forms/visibleErrors';

export type TextField = 'fullName' | 'email' | 'password' | 'confirmPassword';
export type RegisterField = TextField | 'acceptedTerms';

export type RegisterState = {
  status: 'editing' | 'submitting' | 'unavailable';
  values: Record<TextField, string>;
  acceptedTerms: boolean;
  touched: Record<RegisterField, boolean>;
  fieldErrors: RegistrationErrors;
  /** El último intento se rechazó porque el correo ya existe (002 US3). */
  emailTaken: boolean;
  notice: string | null;
};

export type RegisterAction =
  | { type: 'change'; field: TextField; value: string }
  | { type: 'toggleTerms'; checked: boolean }
  | { type: 'blur'; field: RegisterField }
  | { type: 'showNotice'; message: string }
  | { type: 'submit' }
  | { type: 'result'; result: RegistrationResult };

const untouched: Record<RegisterField, boolean> = {
  fullName: false,
  email: false,
  password: false,
  confirmPassword: false,
  acceptedTerms: false,
};

export const initialRegisterState: RegisterState = {
  status: 'editing',
  values: { fullName: '', email: '', password: '', confirmPassword: '' },
  acceptedTerms: false,
  touched: untouched,
  fieldErrors: {},
  emailTaken: false,
  notice: null,
};

/** Errores visibles: validación de campos tocados más el rechazo por correo existente. */
function computeErrors(state: RegisterState): RegistrationErrors {
  const errors = visibleErrors(
    validateRegistration({ ...state.values, acceptedTerms: state.acceptedTerms }),
    state.touched,
  );
  if (state.emailTaken && !errors.email) errors.email = MESSAGES.EMAIL_TAKEN;
  return errors;
}

function withErrors(state: RegisterState): RegisterState {
  return { ...state, fieldErrors: computeErrors(state) };
}

/** Máquina de estados del formulario de registro (data-model.md, RegisterFormState). */
export function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'change':
      return withErrors({
        ...state,
        status: state.status === 'unavailable' ? 'editing' : state.status,
        values: { ...state.values, [action.field]: action.value },
        emailTaken: action.field === 'email' ? false : state.emailTaken,
      });

    case 'toggleTerms':
      return withErrors({
        ...state,
        acceptedTerms: action.checked,
        touched: { ...state.touched, acceptedTerms: true },
      });

    case 'blur':
      return withErrors({ ...state, touched: { ...state.touched, [action.field]: true } });

    case 'showNotice':
      return { ...state, notice: action.message };

    case 'submit': {
      if (state.status === 'submitting') return state;
      const touched = { ...state.touched };
      for (const field of Object.keys(touched) as RegisterField[]) touched[field] = true;
      const next = withErrors({ ...state, touched, notice: null });
      // FR-009: no se registra mientras existan errores de validación.
      const hasErrors = Object.keys(next.fieldErrors).length > 0;
      return { ...next, status: hasErrors ? 'editing' : 'submitting' };
    }

    case 'result':
      switch (action.result.kind) {
        case 'success':
          // El formulario se desmonta al volver al login (research.md R6).
          return state;
        case 'email-taken':
          // US3-3: se vacían las contraseñas sin mostrar todavía sus errores de campo vacío.
          return withErrors({
            ...state,
            status: 'editing',
            emailTaken: true,
            values: { ...state.values, password: '', confirmPassword: '' },
            touched: { ...state.touched, password: false, confirmPassword: false },
          });
        case 'unavailable':
          return { ...state, status: 'unavailable' };
      }
  }
}
