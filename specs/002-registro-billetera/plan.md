# Implementation Plan: Pantalla de Registro de KynWallet

**Branch**: `feature/registro-matias-lopez-mauro` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-registro-billetera/spec.md`

## Summary

Pantalla de registro solo-cliente, fiel al diseño de Figma (`04 · Registro`, nodo `31:2`), que se
suma a la demo de login existente (`001-login-billetera`). Permite ingresar nombre completo,
correo, contraseña y confirmación, aceptar términos y crear una cuenta en memoria. Tras el
registro vuelve al login con el correo precargado y un aviso; el usuario debe iniciar sesión
con la contraseña creada. Se reutilizan el stack, la Clean Architecture y los componentes de UI
de 001. Los cambios principales son:

- un almacén de cuentas en memoria compartido por la autenticación y el registro;
- un nuevo puerto `RegistrationGateway` con su caso de uso;
- reglas de validación de registro en el dominio, que reutilizan las de correo y longitud de
  contraseña;
- un estado de navegación mínimo entre las pantallas de login y registro en `App`, sin router.

Desarrollo guiado por pruebas con Vitest + Testing Library.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), Node.js ≥ 20 LTS para herramientas (igual que 001)

**Primary Dependencies**: React 19, Vite 8, `@fontsource-variable/inter`. **No se agregan
dependencias nuevas.**

**Storage**: N/A. Las cuentas registradas viven en memoria durante la sesión del navegador
(FR-010); al recargar se pierden.

**Testing**: Vitest 5, React Testing Library, `@testing-library/user-event`, jsdom, helper
`axe-core` (`src/test/a11y.ts`), `@vitest/coverage-v8` (igual que 001)

**Target Platform**: navegadores modernos (las dos últimas versiones de Chrome, Firefox, Safari y
Edge), de 320 px a escritorio

**Project Type**: aplicación web de página única (SPA), solo frontend

**Performance Goals**: resultado del intento en ≤ 2 s (SC-002), con una espera simulada de 1 s
(FR-011)

**Constraints**: sin backend, base de datos, APIs externas ni router; WCAG 2.1 AA; sin
credenciales en archivos versionados; sin scroll horizontal desde 320 px; el comportamiento del
login de 001 no cambia salvo el enlace "Regístrate" (FR-019) y el correo precargado con aviso
(FR-014)

**Scale/Scope**: 2 pantallas (login y registro) más la vista de bienvenida existente; 1 pantalla
nueva con ~3 archivos de feature y ningún componente reutilizable nuevo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD | Cada historia empieza con pruebas que fallan, en este orden: dominio (`validateRegistration`), almacén y gateways, caso de uso, reducer, componentes y `App`. Las pruebas se nombran con el ID del escenario (`US2-5`, `FR-005a`) | ✅ |
| II. SOLID | `RegistrationGateway` es un puerto separado de `AuthGateway` (ISP). Los dos gateways en memoria dependen de una abstracción de almacén inyectada (DIP). `BrandPanel` se extiende por props sin cambiar su comportamiento (OCP) | ✅ |
| III. Clean Architecture | Reglas de registro en `domain/`; caso de uso `register` en `application/`; almacén y gateway en `infrastructure/`; la UI recibe los casos de uso por inyección desde `main.tsx`. Se mantiene la regla ESLint `no-restricted-imports` | ✅ |
| IV. DRY/KISS/YAGNI | Correo y longitud de contraseña reutilizan las funciones de 001 (fuente única); los textos van en `MESSAGES`; la lógica de errores visibles se comparte entre los reducers de login y registro. Sin router, librería de formularios ni estado global | ✅ |
| V. Seguridad | Validación en el límite. Las contraseñas no se registran, no se envían al login (FR-014b) y no se persisten (FR-015). Las cuentas de demostración siguen en `.env.local`. El mensaje explícito de correo duplicado es una desviación aceptada (ver Complexity Tracking) | ✅ con desviación aprobada en la spec |
| VI. BRD/ARD | No existen (supuesto de la spec) | ✅ N/A |
| 7. Dependencias | Ninguna nueva | ✅ |
| 8.1 Pruebas | Unitarias (dominio, almacén, gateways, caso de uso, reducer) e integración de componentes y de `App` para el flujo registro → login → bienvenida (SC-004). Cobertura ≥ 80 % | ✅ |
| 8.2 Convenciones | ESLint + Prettier + `tsc --noEmit` (script `verify`) | ✅ |
| 8.3 Documentación | Contratos nuevos; actualización del contrato de UI de 001 por FR-019; README y quickstart | ✅ |
| 8.4 Accesibilidad AA | Contrato de UI con roles y nombres accesibles; `axe-core` en las pruebas; se reutilizan los tokens accesibles de 001 | ⚠️ hereda la desviación de colores de 001 (ver Complexity Tracking) |
| 8.5 Reutilización | Se reutilizan `TextField`, `PasswordField`, `Button`, `Checkbox`, `Divider`, `SocialButton`, `Alert` y `BrandPanel` | ✅ |
| 8.6 Sistema de diseño | Los tokens de Figma del frame `31:2` coinciden con los de 001 (research R2) | ✅ |
| 9.2 Trazabilidad | Pruebas nombradas por escenario o requisito; las tareas referencian FR y US | ✅ |
| 9.3/9.4 Revisión y controles | Repositorio git disponible; integración por PR con `npm run verify` | ✅ |

**Resultado del gate**: APROBADO. Hay una desviación nueva, ya decidida en la spec (correo
duplicado explícito), y una heredada de 001 (contraste), ambas justificadas abajo.

**Re-check post-diseño (Phase 1)**: data-model, contratos y quickstart mantienen las mismas
conclusiones. El único cambio a código de 001 es el refactor del almacén de cuentas (R3); los
contratos C1–C6 de `AuthGateway` no cambian.

## Project Structure

### Documentation (this feature)

```text
specs/002-registro-billetera/
├── plan.md                      # Este archivo
├── research.md                  # Phase 0
├── data-model.md                # Phase 1
├── quickstart.md                # Phase 1
├── contracts/
│   ├── registration-gateway.md  # Puerto de registro y almacén de cuentas
│   └── ui-registro.md           # Contrato observable de la UI (registro y cambios al login)
├── checklists/
│   └── requirements.md
└── tasks.md                     # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

Solo se listan los archivos nuevos (`+`) y modificados (`~`); el resto de la estructura es la de
[001 plan.md](../001-login-billetera/plan.md#source-code-repository-root).

```text
src/
├── main.tsx                         ~ crea el almacén compartido y los dos casos de uso
├── App.tsx                          ~ navegación login ↔ registro y correo precargado
├── domain/
│   ├── auth.ts                      ~ RegistrationRequest, NewAccount, RegistrationResult
│   ├── validation.ts                ~ exporta reglas reutilizables; validateRegistration, normalizeFullName
│   └── messages.ts                  ~ textos de registro
├── application/
│   ├── ports/RegistrationGateway.ts + puerto de registro
│   └── register.ts                  + caso de uso
├── infrastructure/
│   ├── InMemoryAccountStore.ts      + cuentas de demo + cuentas de la sesión
│   ├── InMemoryAuthGateway.ts       ~ lee del almacén en lugar de un arreglo fijo
│   ├── InMemoryRegistrationGateway.ts + registro simulado con espera
│   └── loadDemoAccounts.ts          ~ usa el límite de nombre del dominio
└── ui/
    ├── layout/BrandPanel/           ~ titular y texto de apoyo por props (por defecto, los del login)
    ├── forms/visibleErrors.ts       + helper compartido de errores visibles (extraído de loginReducer)
    └── features/
        ├── login/                   ~ LoginForm: "Regístrate" navega; correo precargado y aviso
        │   ├── loginReducer.ts      ~ estado inicial parametrizable y aviso de registro
        │   └── useLoginForm.ts      ~ recibe el estado inicial
        └── register/                + RegisterForm.tsx, registerReducer.ts, useRegisterForm.ts (+ pruebas)
```

**Structure Decision**: se mantiene el proyecto único de frontend de 001, con capas por carpeta y
pruebas junto al código. La pantalla de registro es una nueva carpeta de feature, `ui/features/register/`. Se
monta dentro del mismo layout de dos paneles: `LoginScreen` se usa como contenedor común y
recibe los textos del panel de marca por props, para no duplicar el layout.

## Complexity Tracking

| Violación / desviación | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Mensaje explícito "Ya existe una cuenta con este correo", que revela si un correo existe (difiere de 001 FR-010) | Decisión del responsable funcional en la aclaración del 2026-10-19 (spec, Clarifications), por usabilidad en la demo. Riesgo bajo: no hay datos reales. **DEBE revisarse con el responsable de seguridad antes de cualquier entorno real** (Principio V) | Un mensaje genérico fue rechazado en la aclaración |
| Colores de texto, botón y bordes distintos a los de Figma (heredado de 001) | Los tokens originales no alcanzan WCAG AA (001 research R3). Se reutilizan los tokens accesibles ya existentes y no se crean nuevos | Igual que en 001: reproducir los colores exactos incumple 8.4 |
| Refactor de `InMemoryAuthGateway` para leer de un almacén compartido | FR-013 exige que una cuenta registrada pueda iniciar sesión. Con un arreglo fijo en el gateway eso no es posible sin compartir estado mutable | Mutar desde fuera el arreglo que recibe el gateway acopla los dos adaptadores de forma implícita y frágil |

## Notas

- La rama no sigue el formato `###-nombre` que esperan los scripts de Spec Kit: la nombró el
  responsable para la revisión. La carpeta de la spec sí usa la numeración secuencial (`002-`).
- No se cambia el comportamiento de "Recordarme", "¿Olvidaste tu contraseña?", Google ni Apple
  en el login.
