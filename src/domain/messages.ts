/** Textos visibles para el usuario. Fuente única (Constitución, Principio IV). */
export const MESSAGES = {
  EMAIL_REQUIRED: 'Ingresa tu correo electrónico',
  EMAIL_INVALID: 'Ingresa un correo electrónico válido',
  PASSWORD_REQUIRED: 'Ingresa tu contraseña',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_TOO_LONG: 'La contraseña no puede superar 128 caracteres',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  UNAVAILABLE: 'Servicio de acceso no disponible. Intenta más tarde.',
  FEATURE_UNAVAILABLE: 'Función no disponible en esta demostración',
  COMING_SOON: 'Próximamente',
  FULL_NAME_REQUIRED: 'Ingresa tu nombre completo',
  FULL_NAME_INVALID: 'Ingresa un nombre válido',
  NEW_PASSWORD_REQUIRED: 'Ingresa una contraseña',
  PASSWORD_WEAK: 'La contraseña debe incluir al menos una mayúscula, un número o un símbolo',
  CONFIRM_PASSWORD_REQUIRED: 'Confirma tu contraseña',
  PASSWORDS_MISMATCH: 'Las contraseñas no coinciden',
  TERMS_REQUIRED: 'Debes aceptar los términos y condiciones',
  EMAIL_TAKEN: 'Ya existe una cuenta con este correo',
  REGISTER_UNAVAILABLE: 'Servicio de registro no disponible. Intenta más tarde.',
  registered: (name: string) =>
    `¡Listo, ${name}! Tu cuenta fue creada. Inicia sesión con tu contraseña.`,
} as const;
