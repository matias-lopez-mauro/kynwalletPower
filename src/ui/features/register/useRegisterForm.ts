import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { Register } from '@/application/register';
import { validateRegistration, type RegistrationErrors } from '@/domain/validation';
import {
  initialRegisterState,
  registerReducer,
  type RegisterField,
  type TextField,
} from './registerReducer';

export type RegisteredAccount = { email: string; displayName: string };

type Callbacks = {
  onRegistered: (account: RegisteredAccount) => void;
  /** El correo ya existe: la vista mueve el foco al campo de correo (002 US3-1). */
  onEmailTaken: () => void;
};

export function useRegisterForm(register: Register, { onRegistered, onEmailTaken }: Callbacks) {
  const [state, dispatch] = useReducer(registerReducer, initialRegisterState);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const change = useCallback((field: TextField, value: string) => {
    dispatch({ type: 'change', field, value });
  }, []);

  const toggleTerms = useCallback((checked: boolean) => {
    dispatch({ type: 'toggleTerms', checked });
  }, []);

  const blur = useCallback((field: RegisterField) => dispatch({ type: 'blur', field }), []);

  const showNotice = useCallback(
    (message: string) => dispatch({ type: 'showNotice', message }),
    [],
  );

  /** Valida y, si procede, registra. Devuelve los errores para que la vista gestione el foco. */
  const submit = useCallback((): RegistrationErrors => {
    if (inFlight.current) return {};
    const request = { ...state.values, acceptedTerms: state.acceptedTerms };
    const errors = validateRegistration(request);
    dispatch({ type: 'submit' });
    if (Object.keys(errors).length > 0) return errors;
    inFlight.current = true;
    void register(request).then((result) => {
      inFlight.current = false;
      if (!mounted.current) return;
      dispatch({ type: 'result', result });
      if (result.kind === 'success') {
        onRegistered({ email: result.email, displayName: result.displayName });
      } else if (result.kind === 'email-taken') {
        onEmailTaken();
      }
    });
    return {};
  }, [register, onRegistered, onEmailTaken, state.values, state.acceptedTerms]);

  return { state, change, toggleTerms, blur, submit, showNotice };
}
