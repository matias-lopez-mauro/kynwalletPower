# Research: Pantalla de Registro de KynWallet

**Feature**: `002-registro-billetera` | **Date**: 2026-10-19

Todas las incógnitas del Technical Context quedan resueltas aquí. Las decisiones de stack,
estilos, pruebas, controles y diseño responsivo de 001 se heredan sin cambios
([001 research.md](../001-login-billetera/research.md), R1, R2, R8, R9 y R10).

## R1. Stack y dependencias

- **Decision**: el mismo stack de 001, sin dependencias nuevas.
- **Rationale**: el registro solo agrega un formulario, reglas puras y un adaptador en memoria
  (Principio IV, regla 7.4).
- **Alternatives considered**: React Hook Form + Zod para el formulario de 5 controles. Se
  rechaza porque el patrón de reducer de 001 ya cubre el caso y una dependencia nueva requiere
  justificación (7.4).

## R2. Tokens y medidas del diseño (Figma, nodo `31:2`)

- **Decision**: reutilizar `tokens.css` sin cambios.
- **Hallazgos** (`get_variable_defs` y `get_metadata` sobre el archivo
  `RkIsF68lskhVAvWODEXceK`):
  - Las variables de color son las mismas de 001 (`neutral/0`, `300`, `400`, `500`, `700`,
    `900`; `brand/500`, `brand/600`).
  - El panel de marca mide 620 px, igual que en el login. Solo cambian el titular ("Comienza tu
    camino financiero.") y el texto de apoyo.
  - Formulario de 400 px de ancho; campos y botón de 52 px de alto; botones sociales de 48 px
    (192 px cada uno).
  - Separación vertical entre campos: 16 px (en el login es 22 px). Etiqueta a 7 px del campo.
  - El título empieza más arriba que en el login (y = 140 frente a 250), porque el formulario
    es más alto.
- **Verificado (T002, `get_design_context` sobre `31:2`, 2026-10-19)**:
  - **Coinciden con 001**: tipografía Inter (título 30 px Bold, titular 44 px Bold con
    line-height 1.08, texto de apoyo 17 px, etiquetas 14 px Medium, botón 16 px SemiBold);
    radios de 12 px en campos y botones, 6 px en la casilla y 22 px en la tarjeta; bordes de
    1,5 px; colores de texto y de borde.
  - **Diferencias con 001** (se registran para la revisión visual, SC-007; no se implementan sin
    aprobación de diseño, para no duplicar el panel de marca):
    - Degradado del panel a `70.73deg, #ff8a65 31.7%, #ef5226 83.46%`; el login usa
      `121.19deg, #ff8a65 0%, #ef5226 70.71%`.
    - Logo formado por dos puntos (10×28 y 14×14) en lugar del SVG de 20×44 del login.
    - Chip de la tarjeta con una línea interior `rgba(22,24,44,.15)` de 4 px.
  - **Recursos gráficos**: la política de red del entorno bloquea `www.figma.com`, así que no
    se descargaron los SVG del frame. Se reutilizan los del login (`logo-mark.svg`, `eye.svg`,
    `social-placeholder.svg`), que corresponden a los mismos marcadores de posición.

## R3. Almacén de cuentas compartido

- **Problema**: `InMemoryAuthGateway` recibe un arreglo fijo de `DemoAccount`. FR-013 exige que
  las cuentas registradas en la sesión puedan iniciar sesión.
- **Decision**: crear `InMemoryAccountStore` en `infrastructure/`:
  - Se construye con las cuentas de demostración (o `null` si la configuración es inválida).
  - Expone `findByEmail(email)` y `add(account)`.
  - `InMemoryAuthGateway` e `InMemoryRegistrationGateway` reciben la misma instancia por
    inyección desde `main.tsx`.
  - El almacén no es un puerto de la capa de aplicación: es un detalle interno de los adaptadores
    en memoria.
- **Rationale**: un único dueño del estado mutable. Cada gateway sigue cumpliendo su contrato
  (AuthGateway C1–C6 sin cambios), y el cambio de origen de datos sigue localizado en
  `infrastructure/` (Principio III).
- **Alternatives considered**:
  - Que un solo adaptador implemente los dos puertos: mezcla responsabilidades (2.1).
  - Compartir el mismo arreglo mutable entre adaptadores: acoplamiento implícito.
  - `localStorage`: la spec excluye la persistencia y FR-015 prohíbe guardar contraseñas en el
    navegador.
- **Configuración inválida**: si `VITE_DEMO_USERS` falta o es inválida, el almacén es `null` y
  tanto el login como el registro responden `unavailable`. Así hay una sola regla de
  disponibilidad del servicio.

## R4. Reglas de validación del registro

- **Decision**: añadir `validateRegistration(request) → RegistrationErrors` en
  `domain/validation.ts`. Es una función pura que reutiliza `validateEmail` y la regla de
  longitud de contraseña de 001; ambas se exportan para tener una sola fuente.
- **Nombre completo** (FR-003):
  - Se normaliza con `normalizeFullName`: recortar y colapsar espacios internos.
  - Longitud de 2 a 100 caracteres.
  - Patrón Unicode `^\p{L}+(?:[ '’-]\p{L}+)*$` (flag `u`): letras con tildes y "ñ", separadas
    por un espacio, apóstrofo (recto o tipográfico) o guion. Ejemplo válido:
    "María José O'Neill-Peña".
- **Contraseña** (FR-005, FR-005a):
  - Longitud de 8 a 128 caracteres, con las mismas constantes y mensajes que el login.
  - Además, debe tener al menos un carácter de la clase `[\p{Lu}\p{Nd}]` o
    `[^\p{L}\p{N}\s]`, es decir, una mayúscula, un dígito o un símbolo.
  - La contraseña no se recorta.
  - El mensaje de campo vacío difiere del login: "Ingresa una contraseña". Por eso la regla de
    longitud se extrae como función que devuelve el tipo de error, y cada formulario elige su
    texto de "vacío".
- **Confirmación** (FR-006): obligatoria e idéntica a la contraseña (comparación exacta).
- **Términos** (FR-007): `acceptedTerms === true`.
- **Rationale**: validaciones puras y deterministas, fáciles de probar con `it.each`. Las clases
  Unicode evitan excluir nombres en español.
- **Alternatives considered**: `[A-Za-zÁÉÍÓÚáéíóúÑñÜü]` como lista explícita. Es frágil ante
  otros alfabetos latinos y no aporta más seguridad.
- **Límite de nombre de las cuentas de demostración**: `loadDemoAccounts` usa hoy un máximo de
  80 caracteres. Se reemplaza por la constante del dominio `FULL_NAME_MAX_LENGTH = 100`, para
  que una cuenta registrada y una de demostración tengan el mismo límite. Se conserva la regla
  permisiva de caracteres para las cuentas de demostración, para no invalidar configuraciones
  existentes.

## R5. Simulación del registro

- **Decision**: `InMemoryRegistrationGateway.register({ fullName, email, password })`:
  - Espera `delayMs`: 1000 ms por defecto, inyectable para las pruebas.
  - Si el almacén es `null`, responde `unavailable`.
  - Si el correo normalizado ya existe, responde `email-taken`.
  - En otro caso, agrega la cuenta y responde `success` con `displayName` y `email`.
  - Cualquier excepción se convierte en `unavailable` y la promesa nunca se rechaza.
- **Rationale**: es el espejo de `InMemoryAuthGateway` (001 R5) y cumple FR-010 a FR-012.
- **Concurrencia**: el formulario bloquea envíos múltiples (FR-011). El almacén comprueba la
  existencia del correo y agrega la cuenta en un solo paso síncrono, así que no hay carreras.

## R6. Navegación entre login y registro

- **Decision**: `App` guarda un estado mínimo:

  ```ts
  type Route = { screen: 'login'; prefill?: { email: string; notice: string } } | { screen: 'register' };
  ```

  - `LoginForm` recibe `onRegister()`, y opcionalmente `initialEmail` y `notice`.
  - `RegisterForm` recibe `onLogin()` y `onRegistered({ email, displayName })`.
  - Cada cambio de pantalla monta un formulario nuevo (`key` distinto). Así los datos de una
    pantalla nunca pasan a la otra (FR-014b, US5-2).
- **Rationale**: dos pantallas no justifican un router (YAGNI). La spec acepta perder el estado
  al recargar.
- **Alternatives considered**: React Router (dependencia nueva para 2 vistas); hash routing
  manual (añade sincronización con la URL que la spec no pide).
- **Foco al volver al login** (FR-014): el login montado con `initialEmail` enfoca el campo de
  contraseña. El aviso se muestra con `role="status"` para que se anuncie sin robar el foco.

## R7. Estado del formulario de registro

- **Decision**: `useRegisterForm` sobre `registerReducer`, con la misma forma que el de login:
  - Estados `editing → submitting → (editing con error de correo | unavailable)`. En éxito no
    hay estado propio: se llama a `onRegistered`.
  - Errores por campo visibles solo en campos tocados.
  - La confirmación se revalida cuando cambia la contraseña (US2-9).
- **Helper compartido**: el filtrado de errores visibles (`visibleErrors`) se extrae de
  `loginReducer` a `ui/forms/visibleErrors.ts` como función genérica sobre el tipo de campos.
  Así login y registro no duplican la regla (4.1).
- **`email-taken`** (US3): el error se asigna al campo de correo, se vacían las dos contraseñas y
  el foco va al correo. Al editar el correo, el error desaparece.

## R8. Cambios en el login (001)

- "Regístrate" deja de mostrar el aviso de función no disponible y llama a `onRegister`
  (FR-019). Se actualiza la prueba de 001 US5-1 para que excluya "Regístrate" y se agrega una
  prueba de navegación.
- `loginReducer` acepta un estado inicial con `values.email` precargado y un aviso
  `registeredNotice`. Este aviso es independiente de `notice`, el de función no disponible, para
  no cambiar el comportamiento de US5-1 de 001. `registeredNotice` se limpia al editar un campo
  o al enviar (FR-014b).
- El aviso de registro es "¡Listo, {nombre}! Tu cuenta fue creada. Inicia sesión con tu
  contraseña." y se define en `MESSAGES` como función, `registered(name)`.

## R9. Panel de marca

- **Decision**: `BrandPanel` acepta `title` (líneas) y `subtitle` por props, con los textos del
  login como valores por defecto. La tarjeta ilustrativa y el logo no cambian.
- **Rationale**: cumple FR-001 con el titular de Figma sin duplicar el layout (8.5), y el login no
  cambia (OCP).
- **Nota de diseño**: en `31:2` el chip de la tarjeta tiene una línea interior que no aparece en
  el login. Se considera una variación menor y se omite salvo que diseño indique lo contrario.
  Se registra para la revisión visual (SC-007).
