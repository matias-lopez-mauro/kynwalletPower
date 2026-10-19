---

description: "Task list for 002-registro-billetera"
---

# Tasks: Pantalla de Registro de KynWallet

**Input**: Design documents from `/specs/002-registro-billetera/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/registration-gateway.md,
contracts/ui-registro.md, quickstart.md

**Tests**: OBLIGATORIAS. La Constitución (Principio I, TDD) exige escribir las pruebas antes del
código y verlas fallar. Cada historia empieza por sus pruebas. En los refactors de código de 001,
las pruebas existentes DEBEN seguir pasando sin cambiar su intención.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Rutas relativas a la raíz del repositorio. Las pruebas viven junto al código (`*.test.ts(x)`).
- Trazabilidad (Constitución 9.2): cada `it(...)` DEBE empezar con el ID del escenario o
  requisito que verifica, p. ej. `it('US2-5: rechaza una contraseña sin mayúscula, número ni símbolo')`.
  Para escenarios de 002 que comparten ID con 001, usar el prefijo `REG-` (p. ej. `REG-US2-5`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar la línea base. El proyecto, las herramientas y los controles ya existen
desde 001 y no se agregan dependencias (plan.md).

- [ ] T001 Ejecutar `npm ci` y `npm run verify` sobre la rama `feature/registro-matias-lopez-mauro` y confirmar que todo pasa antes de cambiar código. Registrar la cobertura actual como referencia (Constitución 8.1: no debe disminuir)
- [ ] T002 [P] Obtener del MCP de Figma `get_design_context` sobre el nodo `31:2` del archivo `RkIsF68lskhVAvWODEXceK` y confirmar tipografías, radios, degradado y separaciones del formulario frente a research.md R2. Si algo difiere de 001, anotarlo en research.md antes de implementar. No modificar el archivo de Figma

**Checkpoint**: `npm run verify` en verde sobre la línea base

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos, textos, reglas reutilizables, almacén de cuentas compartido y piezas de UI
que todas las historias usan

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Agregar a `src/domain/auth.ts` los tipos de contracts/registration-gateway.md: `RegistrationRequest`, `NewAccount` y `RegistrationResult` (`success` con `displayName` y `email`, `email-taken`, `unavailable`)
- [ ] T004 [P] Agregar a `src/domain/messages.ts` los textos de data-model.md: `FULL_NAME_REQUIRED`, `FULL_NAME_INVALID`, `NEW_PASSWORD_REQUIRED` ("Ingresa una contraseña"), `PASSWORD_WEAK`, `CONFIRM_PASSWORD_REQUIRED`, `PASSWORDS_MISMATCH`, `TERMS_REQUIRED`, `EMAIL_TAKEN` ("Ya existe una cuenta con este correo"), `REGISTER_UNAVAILABLE` ("Servicio de registro no disponible. Intenta más tarde.") y la función `registered(name)` ("¡Listo, {name}! Tu cuenta fue creada. Inicia sesión con tu contraseña."). No cambiar los textos existentes
- [ ] T005 Refactor en `src/domain/validation.ts` sin cambio de comportamiento (las pruebas de 001 deben seguir pasando): exportar `validateEmail` y extraer la regla de longitud de contraseña a una función exportada que devuelva el mensaje de longitud (corta o larga) o `undefined`. `validateCredentials` la reutiliza (research.md R4)
- [ ] T006 [P] Pruebas (que deben fallar) de `InMemoryAccountStore` en `src/infrastructure/InMemoryAccountStore.test.ts`: con `null`, `isAvailable()` es `false`; `findByEmail` compara por correo normalizado; `add` devuelve `added` y la cuenta pasa a encontrarse; `add` con un correo existente, sin distinguir mayúsculas ni espacios, devuelve `email-taken` y no sobrescribe la cuenta (data-model.md)
- [ ] T007 Implementar `src/infrastructure/InMemoryAccountStore.ts` hasta pasar T006
- [ ] T008 Refactor de `src/infrastructure/InMemoryAuthGateway.ts` para recibir un `InMemoryAccountStore` en lugar del arreglo de cuentas (contracts/registration-gateway.md). Adaptar `src/infrastructure/InMemoryAuthGateway.test.ts` construyendo el almacén; los casos C1–C6 de 001 deben seguir pasando sin cambiar su intención. Depende de T007
- [ ] T009 [P] Pruebas y cambio en `src/infrastructure/loadDemoAccounts.ts` y su prueba: el límite de `displayName` pasa de 80 a `FULL_NAME_MAX_LENGTH = 100`, constante exportada desde `src/domain/validation.ts` (research.md R4). Agregar los casos de 100 caracteres (válido) y 101 (inválido)
- [ ] T010 Actualizar `src/main.tsx` para crear un único `InMemoryAccountStore` y pasarlo a `InMemoryAuthGateway` (contracts/registration-gateway.md, composición). Depende de T008
- [ ] T011 [P] Extraer de `src/ui/features/login/loginReducer.ts` el filtrado de errores visibles a `src/ui/forms/visibleErrors.ts` como función genérica sobre los campos (research.md R7), con su prueba `src/ui/forms/visibleErrors.test.ts`. `loginReducer` la reutiliza y sus pruebas siguen pasando
- [ ] T012 [P] Pruebas (que deben fallar) en `src/ui/layout/BrandPanel/BrandPanel.test.tsx`: sin props muestra los textos del login; con `title` y `subtitle` muestra "Comienza tu camino financiero." y su texto de apoyo; la tarjeta es `aria-hidden` (research.md R9)
- [ ] T013 Implementar las props `title` y `subtitle` de `src/ui/layout/BrandPanel/BrandPanel.tsx`, con los textos del login por defecto, hasta pasar T012. `LoginScreen` acepta y propaga esas props

**Checkpoint**: `npm run verify` sigue en verde; el login se comporta igual que antes

---

## Phase 3: User Story 1 - Crear una cuenta con datos válidos (Priority: P1) 🎯 MVP

**Goal**: con datos válidos, el usuario crea una cuenta, vuelve al login con su correo precargado
y solo accede tras ingresar la contraseña creada

**Independent Test**: quickstart escenarios 1–4

### Tests for User Story 1 ⚠️

> Escribir primero; confirmar que FALLAN antes de implementar

- [ ] T014 [P] [US1] Pruebas de `normalizeFullName` en `src/domain/validation.test.ts`: recorta los espacios periféricos y colapsa los internos (`'  Ana   Pérez '` → `'Ana Pérez'`)
- [ ] T015 [P] [US1] Pruebas de `InMemoryRegistrationGateway` en `src/infrastructure/InMemoryRegistrationGateway.test.ts`: R1, que una cuenta nueva devuelva `success` con `displayName` y `email` normalizados y que después `InMemoryAuthGateway` con el mismo almacén la autentique (FR-013, SC-004); R3, almacén no disponible → `unavailable`; R4, una excepción interna → `unavailable` sin rechazar la promesa; espera configurable `delayMs`
- [ ] T016 [P] [US1] Pruebas del caso de uso en `src/application/register.test.ts`: U1, delega `fullName` y `email` normalizados y la contraseña sin modificar, sin `confirmPassword` ni `acceptedTerms`; U2, si el gateway lanza una excepción devuelve `unavailable`
- [ ] T017 [P] [US1] Pruebas de `registerReducer` en `src/ui/features/register/registerReducer.test.ts`: `change` actualiza valores; `submit` válido pasa a `submitting` y un segundo `submit` se ignora (REG-US1-2, FR-011); `result` `unavailable` muestra el estado `unavailable`
- [ ] T018 [P] [US1] Pruebas de `loginReducer` en `src/ui/features/login/loginReducer.test.ts`: `createInitialLoginState({ email, registeredNotice })` precarga el correo y el aviso; sin argumentos equivale al estado inicial de 001; editar un campo o enviar limpia `registeredNotice` (FR-014b); `logout` vuelve al estado vacío
- [ ] T019 [US1] Pruebas de integración en `src/App.test.tsx`: desde el login, "Regístrate" abre "Crea tu cuenta" (REG-US5-1, FR-019); al completar datos válidos y "Crear cuenta", el botón queda en carga ("Creando cuenta…", `aria-busy`) y luego aparece el login con el correo normalizado precargado, la contraseña vacía y con el foco, y el aviso `status` con el nombre (REG-US1-1, REG-US1-4, FR-014); con la contraseña creada se llega a "¡Bienvenido, {nombre}!", y con otra, a "Correo o contraseña incorrectos" (REG-US1-3, FR-014a); Enter en un campo envía el formulario (REG-US1-5). Usar `delayMs: 0` o temporizadores falsos

### Implementation for User Story 1

- [ ] T020 [P] [US1] Implementar `normalizeFullName` en `src/domain/validation.ts` hasta pasar T014
- [ ] T021 [P] [US1] Crear el puerto `src/application/ports/RegistrationGateway.ts` y el caso de uso `src/application/register.ts` (`createRegister`) hasta pasar T016
- [ ] T022 [P] [US1] Implementar `src/infrastructure/InMemoryRegistrationGateway.ts` hasta pasar T015. Depende de T007
- [ ] T023 [US1] Implementar `src/ui/features/register/registerReducer.ts` y `useRegisterForm.ts` hasta pasar T017. El hook llama a `register`, bloquea envíos concurrentes y, en `success`, invoca `onRegistered({ email, displayName })`
- [ ] T024 [US1] Implementar `src/ui/features/register/RegisterForm.tsx` y `RegisterForm.module.css` según contracts/ui-registro.md y Figma `31:2`: título, subtítulo, los cuatro campos (`TextField` y dos `PasswordField` con `autocomplete=new-password`), casilla de términos (`Checkbox`), botón "Crear cuenta" con `loadingLabel` "Creando cuenta…", divisor "o regístrate con", botones sociales y pie "¿Ya tienes cuenta? Inicia sesión"; separación entre campos de 16 px (research.md R2)
- [ ] T025 [US1] Implementar en `src/ui/features/login/loginReducer.ts` y `useLoginForm.ts` el estado inicial parametrizable (`createInitialLoginState`) y `registeredNotice`, hasta pasar T018
- [ ] T026 [US1] Actualizar `src/ui/features/login/LoginForm.tsx`: props `onRegister`, `initialEmail` y `registeredNotice`; "Regístrate" llama a `onRegister`; con `initialEmail`, el foco inicial va a la contraseña; el aviso se muestra con `Alert` en rol `status`. Actualizar `LoginForm.test.tsx`: la prueba de 001 US5-1 deja de incluir "Regístrate"
- [ ] T027 [US1] Implementar la navegación en `src/App.tsx` (research.md R6): estado `Route`, `key` distinto por pantalla para no conservar datos, `BrandPanel` con los textos del registro en esa pantalla. Actualizar `src/main.tsx` para crear `register` con el mismo almacén e inyectarlo en `App`, hasta pasar T019

**Checkpoint**: US1 funciona de punta a punta (quickstart 1–4) y las pruebas de 001 siguen en verde

---

## Phase 4: User Story 2 - Validar los datos antes de crear la cuenta (Priority: P1)

**Goal**: el formulario indica qué datos faltan o son inválidos e impide el registro hasta corregirlos

**Independent Test**: quickstart escenarios 6–10

### Tests for User Story 2 ⚠️

- [ ] T028 [P] [US2] Pruebas de `validateRegistration` en `src/domain/validation.test.ts` con `it.each`:
  - **Requeridos** (REG-US2-1): campos vacíos → `FULL_NAME_REQUIRED`, `EMAIL_REQUIRED`, `NEW_PASSWORD_REQUIRED`, `CONFIRM_PASSWORD_REQUIRED` y `TERMS_REQUIRED`.
  - **Nombre** (REG-US2-2, FR-003): "A", "Ana2", "Ana@", 101 caracteres y "--" son inválidos; "Ana", "María José O'Neill-Peña", "Ñandú Ávila" y "Ana O’Neil" son válidos.
  - **Correo** (REG-US2-3): mismas reglas que en 001.
  - **Longitud de contraseña** (REG-US2-4, FR-005): 7 → corta; 129 → larga.
  - **Fortaleza** (REG-US2-5, REG-US2-6, FR-005a):
    - "clavesegura" y "clave segura" → `PASSWORD_WEAK`.
    - "Clavesegura", "clavesegura1", "clave-segura" y "claveseguraÑ" → válidas.
  - **Sin recorte**: la contraseña no se recorta.
  - **Confirmación** (REG-US2-7, FR-006): distinta → `PASSWORDS_MISMATCH`; la comparación es exacta, incluidos espacios y mayúsculas.
  - **Términos** (REG-US2-8, FR-007): sin aceptar → `TERMS_REQUIRED`.
  - **Un mensaje por campo**: cada campo devuelve un único mensaje, en el orden de data-model.md.
- [ ] T029 [P] [US2] Pruebas de `validateCredentials` en `src/domain/validation.test.ts` (FR-005b): "clavesegura" sigue siendo válida en el login
- [ ] T030 [P] [US2] Pruebas de `registerReducer` en `src/ui/features/register/registerReducer.test.ts`: los errores solo se ven en campos tocados (FR-008); `submit` con errores marca todo como tocado y no pasa a `submitting` (FR-009); editar `password` revalida `confirmPassword` si estaba tocado (REG-US2-9); corregir un campo oculta su error
- [ ] T031 [P] [US2] Pruebas de componente en `src/ui/features/register/RegisterForm.test.tsx`: enviar vacío muestra los cinco mensajes y enfoca "Nombre completo" (REG-US2-1); salir de un campo inválido muestra su error (REG-US2-2 a REG-US2-7); los campos con error tienen `aria-invalid` y `aria-describedby` hacia su mensaje (REG-US2-10, FR-018); sin violaciones de `axe`

### Implementation for User Story 2

- [ ] T032 [US2] Implementar `validateRegistration` en `src/domain/validation.ts` reutilizando `validateEmail` y la regla de longitud (T005), y agregar el patrón Unicode de nombre y la regla de fortaleza de research.md R4, hasta pasar T028 y T029
- [ ] T033 [US2] Conectar `validateRegistration` en `registerReducer.ts`, `useRegisterForm.ts` y `RegisterForm.tsx`: errores visibles con `visibleErrors`, revalidación de la confirmación y foco en el primer campo con error, hasta pasar T030 y T031

**Checkpoint**: US1 y US2 funcionan; ningún registro se ejecuta con datos inválidos

---

## Phase 5: User Story 3 - Impedir el registro de un correo ya existente (Priority: P2)

**Goal**: un correo ya registrado no crea cuenta y se informa "Ya existe una cuenta con este correo"

**Independent Test**: quickstart escenario 5

### Tests for User Story 3 ⚠️

- [ ] T034 [P] [US3] Pruebas en `src/infrastructure/InMemoryRegistrationGateway.test.ts`: R2, un correo de demo o creado en la sesión (incluso con mayúsculas o espacios) → `email-taken` y el almacén no cambia (FR-012); R5, el resultado no incluye la contraseña
- [ ] T035 [P] [US3] Pruebas de `registerReducer`: `result` `email-taken` deja el error `EMAIL_TAKEN` en el correo, vacía `password` y `confirmPassword` y conserva nombre y correo (REG-US3-1, REG-US3-3); editar el correo quita el error (REG-US3-2)
- [ ] T036 [P] [US3] Pruebas en `src/ui/features/register/RegisterForm.test.tsx`: tras `email-taken`, el mensaje se anuncia como error del campo de correo y el foco va al correo (REG-US3-1)

### Implementation for User Story 3

- [ ] T037 [US3] Implementar el rechazo por correo existente en `InMemoryRegistrationGateway.ts`, usando `InMemoryAccountStore.add` (atómico), hasta pasar T034
- [ ] T038 [US3] Implementar el manejo de `email-taken` en `registerReducer.ts` y el foco al correo en `RegisterForm.tsx`, hasta pasar T035 y T036

**Checkpoint**: US1 a US3 funcionan de forma independiente

---

## Phase 6: User Story 4 - Mostrar u ocultar las contraseñas (Priority: P3)

**Goal**: cada campo de contraseña tiene su propio control de visibilidad accesible

**Independent Test**: quickstart escenario 11

- [ ] T039 [US4] Pruebas en `src/ui/features/register/RegisterForm.test.tsx`: hay dos botones "Mostrar contraseña"; activar uno solo cambia su campo a texto y su etiqueta a "Ocultar contraseña", con `aria-pressed` (REG-US4-1, REG-US4-2); operables con teclado (REG-US4-3). `PasswordField` ya cumple el comportamiento (001); si las pruebas pasan sin cambios, no se modifica código (YAGNI)

**Checkpoint**: US4 verificada

---

## Phase 7: User Story 5 - Navegar entre login y registro, y elementos fuera de alcance (Priority: P3)

**Goal**: el usuario vuelve al login sin conservar datos, y los elementos fuera de alcance informan que no están disponibles

**Independent Test**: quickstart escenarios 12 y 13

### Tests for User Story 5 ⚠️

- [ ] T040 [P] [US5] Pruebas en `src/ui/features/register/RegisterForm.test.tsx`: "términos y condiciones", "Google" y "Apple" muestran `status` "Función no disponible en esta demostración" y conservan los datos (REG-US5-3, FR-020)
- [ ] T041 [P] [US5] Pruebas en `src/App.test.tsx`: con datos escritos en el registro, "Inicia sesión" muestra el login vacío; al volver a "Regístrate", el registro también está vacío (REG-US5-2)

### Implementation for User Story 5

- [ ] T042 [US5] Implementar en `RegisterForm.tsx` y `registerReducer.ts` el aviso de función no disponible y la llamada a `onLogin` en "Inicia sesión", hasta pasar T040 y T041

**Checkpoint**: todas las historias funcionan de forma independiente

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a varias historias y controles de integración

- [ ] T043 [P] Prueba en `src/App.test.tsx` del caso límite "servicio no disponible": con el almacén en `null`, el registro muestra la alerta "Servicio de registro no disponible. Intenta más tarde." y no expone detalles internos (FR-022)
- [ ] T044 [P] Revisar `RegisterForm.module.css` y `LoginScreen.module.css` a 320 px, 480 px, 960 px y 1440 px: sin scroll horizontal y con el logo visible (FR-021); comparar con el frame `31:2` (SC-007)
- [ ] T045 [P] Confirmar que ninguna prueba ni código escribe contraseñas en `console`, URL o almacenamiento del navegador (FR-015): `no-console` en ESLint y una búsqueda de `localStorage` y `sessionStorage` en `src/`
- [ ] T046 [P] Actualizar `specs/001-login-billetera/contracts/ui-login.md` con los cambios de contracts/ui-registro.md ("Regístrate", aviso, correo precargado, foco) y agregar en `specs/001-login-billetera/spec.md` una nota en FR-016 que remita a 002 FR-019 (trazabilidad, 9.2)
- [ ] T047 [P] Actualizar `README.md` con la pantalla de registro y el enlace a `specs/002-registro-billetera/quickstart.md` (8.3)
- [ ] T048 Ejecutar `npm run verify`: todo en verde, con cobertura ≥ 80 % y no menor que la de T001
- [ ] T049 Ejecutar los 16 escenarios manuales de `specs/002-registro-billetera/quickstart.md` y registrar el resultado en la descripción del PR
- [ ] T050 Abrir el PR desde `feature/registro-matias-lopez-mauro` para revisión por una persona distinta del autor. Mencionar las desviaciones de plan.md (correo duplicado explícito, contraste heredado, refactor del almacén) para su aprobación (9.3)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup y BLOQUEA todas las historias
- **US1 (Phase 3)**: depende de Foundational. Es el MVP
- **US2 (Phase 4)**: depende de Foundational. Necesita `RegisterForm` (T024) para sus pruebas de componente; las de dominio (T028, T029) pueden empezar en paralelo con US1
- **US3 (Phase 5)**: depende de US1 (gateway y reducer)
- **US4 (Phase 6)**: depende de T024
- **US5 (Phase 7)**: depende de T024 y T027
- **Polish (Phase 8)**: depende de todas las historias

### Within Each Phase

- Las pruebas se escriben y FALLAN antes de implementar
- Dominio → infraestructura y aplicación → reducer y hook → componentes → `App`
- Los refactors de código de 001 (T005, T008, T011, T013, T025, T026) mantienen verdes sus pruebas existentes

### Parallel Opportunities

- Phase 2: T003, T004, T006, T009, T011 y T012 en paralelo
- US1: T014 a T018 en paralelo; luego T020, T021 y T022 en paralelo
- US2: T028 a T031 en paralelo
- US3: T034 a T036 en paralelo
- Polish: T043 a T047 en paralelo

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 en paralelo:
Task: "T014 Pruebas de normalizeFullName en src/domain/validation.test.ts"
Task: "T015 Pruebas de InMemoryRegistrationGateway en src/infrastructure/InMemoryRegistrationGateway.test.ts"
Task: "T016 Pruebas del caso de uso en src/application/register.test.ts"
Task: "T017 Pruebas de registerReducer en src/ui/features/register/registerReducer.test.ts"
Task: "T018 Pruebas de loginReducer en src/ui/features/login/loginReducer.test.ts"

# Implementaciones independientes de US1:
Task: "T020 normalizeFullName en src/domain/validation.ts"
Task: "T021 RegistrationGateway y register en src/application/"
Task: "T022 InMemoryRegistrationGateway en src/infrastructure/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational)
2. Completar Phase 3 (US1)
3. **DETENERSE Y VALIDAR**: quickstart escenarios 1–4
4. Demostrar el MVP

### Incremental Delivery

1. Setup + Foundational → base lista, login sin cambios de comportamiento
2. US1 → registro y vuelta al login (MVP)
3. US2 → validaciones completas (con US1, cubre todas las historias P1)
4. US3 → correo duplicado
5. US4 → visibilidad (verificación)
6. US5 → navegación de vuelta y avisos
7. Polish → `npm run verify` en verde y PR para revisión (Constitución 9.3)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- La etiqueta [USn] y los IDs en los nombres de las pruebas dan la trazabilidad requisito → prueba (9.2)
- Hacer commit al cerrar cada tarea o grupo lógico, referenciando el ID de la tarea
- Decisiones pendientes que pueden cambiar tareas:
  - **Correo duplicado explícito**: si seguridad rechaza el mensaje, cambian T004, T034 a T038 y la spec.
  - **Chip de la tarjeta**: si diseño pide la línea del chip (research.md R9), se agrega una tarea a `BrandPanel`.
  - **Diferencias con 001**: si T002 detecta diferencias de tipografía o color con 001, se agregan tareas a `tokens.css`.
