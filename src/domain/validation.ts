import type { LoginCredentials, RegistrationRequest } from './auth';
import { MESSAGES } from './messages';

export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const FULL_NAME_MIN_LENGTH = 2;
export const FULL_NAME_MAX_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Letras (con tildes y "ñ") separadas por un espacio, apóstrofo o guion (002 research.md R4).
const FULL_NAME_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;
// Al menos una mayúscula, un dígito o un símbolo (cualquier carácter que no sea letra,
// dígito ni espacio) (002 FR-005a).
const PASSWORD_STRENGTH_PATTERN = /[\p{Lu}\p{Nd}]|[^\p{L}\p{N}\s]/u;

export type CredentialErrors = Partial<Record<keyof LoginCredentials, string>>;
export type RegistrationErrors = Partial<Record<keyof RegistrationRequest, string>>;

/** Normaliza un correo para validarlo y compararlo: sin espacios periféricos y en minúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Normaliza un nombre completo: sin espacios periféricos y con los internos colapsados. */
export function normalizeFullName(fullName: string): string {
  return fullName.trim().replace(/\s+/g, ' ');
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(normalized);
}

export function isValidPasswordLength(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
}

export function validateEmail(email: string): string | undefined {
  if (normalizeEmail(email) === '') return MESSAGES.EMAIL_REQUIRED;
  if (!isValidEmail(email)) return MESSAGES.EMAIL_INVALID;
  return undefined;
}

/** Regla de longitud compartida por login y registro; no cubre la contraseña vacía. */
export function validatePasswordLength(password: string): string | undefined {
  if (password.length < PASSWORD_MIN_LENGTH) return MESSAGES.PASSWORD_TOO_SHORT;
  if (password.length > PASSWORD_MAX_LENGTH) return MESSAGES.PASSWORD_TOO_LONG;
  return undefined;
}

function validatePassword(password: string): string | undefined {
  // La contraseña se valida sin recortar (FR-004).
  if (password === '') return MESSAGES.PASSWORD_REQUIRED;
  return validatePasswordLength(password);
}

/** Reglas de FR-003 y FR-004. Devuelve {} si las credenciales son válidas. */
export function validateCredentials({ email, password }: LoginCredentials): CredentialErrors {
  const errors: CredentialErrors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

function validateFullName(fullName: string): string | undefined {
  const normalized = normalizeFullName(fullName);
  if (normalized === '') return MESSAGES.FULL_NAME_REQUIRED;
  const validLength =
    normalized.length >= FULL_NAME_MIN_LENGTH && normalized.length <= FULL_NAME_MAX_LENGTH;
  if (!validLength || !FULL_NAME_PATTERN.test(normalized)) return MESSAGES.FULL_NAME_INVALID;
  return undefined;
}

function validateNewPassword(password: string): string | undefined {
  // Como en el login, la contraseña no se recorta.
  if (password === '') return MESSAGES.NEW_PASSWORD_REQUIRED;
  const lengthError = validatePasswordLength(password);
  if (lengthError) return lengthError;
  if (!PASSWORD_STRENGTH_PATTERN.test(password)) return MESSAGES.PASSWORD_WEAK;
  return undefined;
}

function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (confirmPassword === '') return MESSAGES.CONFIRM_PASSWORD_REQUIRED;
  if (confirmPassword !== password) return MESSAGES.PASSWORDS_MISMATCH;
  return undefined;
}

/** Reglas de 002 FR-003 a FR-007. Devuelve {} si la solicitud es válida. */
export function validateRegistration(request: RegistrationRequest): RegistrationErrors {
  const candidates: RegistrationErrors = {
    fullName: validateFullName(request.fullName),
    email: validateEmail(request.email),
    password: validateNewPassword(request.password),
    confirmPassword: validateConfirmPassword(request.password, request.confirmPassword),
    acceptedTerms: request.acceptedTerms ? undefined : MESSAGES.TERMS_REQUIRED,
  };
  const errors: RegistrationErrors = {};
  for (const [field, message] of Object.entries(candidates) as [
    keyof RegistrationRequest,
    string | undefined,
  ][]) {
    if (message) errors[field] = message;
  }
  return errors;
}
