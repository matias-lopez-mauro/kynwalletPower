# Data Model: Pantalla de Registro de KynWallet

**Feature**: `002-registro-billetera` | **Date**: 2026-10-19

No hay persistencia: todas las entidades viven en memoria durante la sesión del navegador. Las
entidades de 001 (`DemoAccount`, `LoginCredentials`, `AuthResult`) se mantienen; ver
[001 data-model.md](../001-login-billetera/data-model.md).

## DemoAccount (dominio, sin cambios de forma)

Representa tanto las cuentas de demostración como las creadas en la sesión. `displayName` es el
nombre completo normalizado.

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Normalizado (trim + minúsculas); único en el almacén |
| `password` | string | Tal cual se ingresó; NO DEBE registrarse ni mostrarse (FR-015) |
| `displayName` | string | 1–100 caracteres (antes 1–80; research R4) |

## RegistrationRequest (dominio, valor)

Datos del formulario de registro.

| Campo | Tipo | Regla (spec) | Mensaje |
|---|---|---|---|
| `fullName` | string | Vacío tras normalizar | "Ingresa tu nombre completo" |
| | | < 2 o > 100 caracteres, o caracteres no permitidos (FR-003) | "Ingresa un nombre válido" |
| `email` | string | Vacío tras trim | "Ingresa tu correo electrónico" |
| | | Formato inválido o > 254 caracteres (FR-004) | "Ingresa un correo electrónico válido" |
| `password` | string | Vacío | "Ingresa una contraseña" |
| | | < 8 caracteres (FR-005) | "La contraseña debe tener al menos 8 caracteres" |
| | | > 128 caracteres (FR-005) | "La contraseña no puede superar 128 caracteres" |
| | | Sin mayúscula, dígito ni símbolo (FR-005a) | "La contraseña debe incluir al menos una mayúscula, un número o un símbolo" |
| `confirmPassword` | string | Vacío | "Confirma tu contraseña" |
| | | Distinta de `password` (FR-006) | "Las contraseñas no coinciden" |
| `acceptedTerms` | boolean | `false` (FR-007) | "Debes aceptar los términos y condiciones" |

`validateRegistration(r) → RegistrationErrors` es una función pura; `{}` significa que es
válido. Cada campo muestra a lo sumo un mensaje, el primero de la tabla que aplique.

**Normalización** (`normalizeFullName`): recortar espacios periféricos y colapsar los internos en
uno solo. Se aplica antes de validar y antes de guardar.

## NewAccount (dominio, valor)

Lo que el caso de uso entrega al puerto: `{ fullName, email, password }`, con `fullName` y
`email` ya normalizados. No incluye `confirmPassword` ni `acceptedTerms` (minimización, 5.4).

## RegistrationResult (dominio, unión discriminada)

| Variante | Datos | Origen |
|---|---|---|
| `success` | `displayName`, `email` | Cuenta creada |
| `email-taken` | — | El correo ya existe en el almacén (FR-012) |
| `unavailable` | — | Almacén no disponible o error inesperado (FR-022) |

## InMemoryAccountStore (infraestructura)

| Operación | Comportamiento |
|---|---|
| `constructor(accounts: DemoAccount[] \| null)` | `null` significa servicio no disponible |
| `isAvailable(): boolean` | `false` si se construyó con `null` |
| `findByEmail(email): DemoAccount \| undefined` | Compara por correo normalizado |
| `add(account): 'added' \| 'email-taken'` | Comprobación y alta atómicas; nunca sobrescribe |

## RegisterFormState (UI, máquina de estados)

```text
                 submit (con errores)
             ┌──────────────────────────┐
             ▼                          │
   ┌──────────────┐  submit (válido)  ┌┴─────────────┐  success
   │   editing    │──────────────────▶│  submitting  │──────────▶ onRegistered(email, name)
   └──────────────┘                   └──────┬───────┘            (App muestra el login)
     ▲        ▲                 email-taken  │  unavailable
     │        └──────── error en el correo ◀─┤
     │                                       ▼
     │                               ┌──────────────┐
     └──── edición de un campo ──────│ unavailable  │
                                     │  (alerta)    │
                                     └──────────────┘
```

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | `'editing' \| 'submitting' \| 'unavailable'` | Estado actual |
| `values` | `{ fullName, email, password, confirmPassword }` | Valores de texto |
| `acceptedTerms` | boolean | Casilla de términos |
| `touched` | por campo, incluido `acceptedTerms` | Validación al salir (FR-008) |
| `fieldErrors` | `RegistrationErrors` | Errores visibles; incluye `email` = "Ya existe una cuenta con este correo" tras `email-taken` |
| `notice` | `string \| null` | "Función no disponible en esta demostración" (FR-020) |

**Transiciones clave**:

- `submit` con errores → sigue en `editing`, todos los campos quedan tocados y el foco va al
  primer campo con error (US2-1).
- `submit` válido → `submitting`; los envíos adicionales se ignoran (FR-011).
- `email-taken` → `editing`. Se agrega el error del correo, se vacían `password` y
  `confirmPassword` y el foco va al correo (US3-1, US3-3).
- Editar el correo → desaparece el error de duplicado (US3-2).
- Editar `password` → se revalida `confirmPassword` si estaba tocado (US2-9).
- `unavailable` → alerta "Servicio de registro no disponible. Intenta más tarde."; editar un
  campo vuelve a `editing`.
- `success` → el hook llama a `onRegistered`. El formulario se desmonta y no conserva datos.

## Cambios en LoginFormState (001)

| Campo | Cambio |
|---|---|
| `values.email` | Puede iniciar con el correo registrado (FR-014) |
| `registeredNotice` | Nuevo: `string \| null`. Aviso de cuenta creada; se limpia al editar un campo o al enviar (FR-014b) |

El estado inicial se construye con `createInitialLoginState({ email?, registeredNotice? })`;
sin argumentos produce el estado inicial actual de 001. `logout` sigue volviendo al estado vacío.
