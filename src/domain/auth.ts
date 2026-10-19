export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResult =
  | { kind: 'success'; displayName: string }
  | { kind: 'invalid-credentials' }
  | { kind: 'unavailable' };

export type RegistrationRequest = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

/** Datos que el caso de uso entrega al puerto de registro, ya normalizados. */
export type NewAccount = {
  fullName: string;
  email: string;
  password: string;
};

export type RegistrationResult =
  | { kind: 'success'; displayName: string; email: string }
  | { kind: 'email-taken' }
  | { kind: 'unavailable' };

export type DemoAccount = {
  email: string;
  password: string;
  displayName: string;
};
