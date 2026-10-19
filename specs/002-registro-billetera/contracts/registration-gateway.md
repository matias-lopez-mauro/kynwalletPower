# Contract: RegistrationGateway (puerto de registro)

Interfaz entre la capa de aplicación y la infraestructura (Constitución 2.4, 2.5 y 3.4). Es un
puerto separado de `AuthGateway` (segregación de interfaces). La UI recibe el caso de uso
`register` por inyección desde la raíz de composición (`src/main.tsx`).

```ts
// src/domain/auth.ts
export type RegistrationRequest = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};
export type NewAccount = { fullName: string; email: string; password: string };
export type RegistrationResult =
  | { kind: 'success'; displayName: string; email: string }
  | { kind: 'email-taken' }
  | { kind: 'unavailable' };

// src/application/ports/RegistrationGateway.ts
export interface RegistrationGateway {
  register(account: NewAccount): Promise<RegistrationResult>;
}

// src/application/register.ts
export type Register = (request: RegistrationRequest) => Promise<RegistrationResult>;
export function createRegister(gateway: RegistrationGateway): Register;
```

## Caso de uso `register`

| # | Dado | Resultado |
|---|---|---|
| U1 | Cualquier solicitud | Delega `{ fullName: normalizeFullName(...), email: normalizeEmail(...), password }`. La contraseña no se modifica; `confirmPassword` y `acceptedTerms` no se envían |
| U2 | El gateway lanza una excepción | `unavailable`; la promesa NO DEBE rechazarse |

La validación de formulario ocurre antes, en la UI, con `validateRegistration` (FR-009).

## Comportamiento obligatorio de toda implementación del puerto

| # | Dado | Resultado |
|---|---|---|
| R1 | Correo no registrado | `success` con `displayName` y `email` normalizados. Desde ese momento `AuthGateway.authenticate` con ese correo y contraseña devuelve `success` (FR-013, SC-004) |
| R2 | Correo ya registrado (demo o sesión), sin distinguir mayúsculas ni espacios periféricos | `email-taken`; el almacén no cambia (FR-012) |
| R3 | Almacén no disponible (configuración de demo ausente o inválida) | `unavailable` |
| R4 | Cualquier excepción interna | `unavailable`; la promesa NO DEBE rechazarse |
| R5 | Cualquier caso | NO DEBE registrar la contraseña ni incluirla en el resultado (FR-015) |

## Implementación de la demostración

```ts
new InMemoryAccountStore(accounts: DemoAccount[] | null)
new InMemoryAuthGateway(store: InMemoryAccountStore, options?: { delayMs?: number })
new InMemoryRegistrationGateway(store: InMemoryAccountStore, options?: { delayMs?: number })
```

- `delayMs` vale 1000 por defecto (FR-011); las pruebas usan 0 o temporizadores falsos.
- `InMemoryAuthGateway` cambia su constructor (antes recibía el arreglo de cuentas). Sus
  contratos C1–C6 de [001 auth-gateway.md](../../001-login-billetera/contracts/auth-gateway.md)
  no cambian, y sus pruebas se adaptan construyendo el almacén.
- Composición en `main.tsx`:

  ```ts
  const store = new InMemoryAccountStore(loadDemoAccounts(import.meta.env.VITE_DEMO_USERS));
  const authenticate = createAuthenticate(new InMemoryAuthGateway(store));
  const register = createRegister(new InMemoryRegistrationGateway(store));
  ```

## Configuración

Sin cambios: `VITE_DEMO_USERS` en `.env.local`, no versionado. Las cuentas registradas no se
escriben en ninguna configuración.
