# Feature Specification: Pantalla de Registro de KynWallet

**Feature Branch**: `feature/registro-matias-lopez-mauro`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Crear la especificación para la pantalla '04 Registro' de la
billetera virtual, a partir del diseño de referencia en Figma, respetando la Constitución del
proyecto."

**Diseño de referencia**: Figma, archivo "Billetera Virtual - Prototipos (Copy)"
(`RkIsF68lskhVAvWODEXceK`), frame `04 · Registro` (nodo `31:2`), 1440 × 1024. Compuesto por:

- **Panel de marca** (izquierda, mismo estilo que `01 · Login`): logo KynWallet, titular
  "Comienza tu camino financiero.", texto de apoyo "Crea tu cuenta en minutos y empieza a enviar,
  recibir y administrar tu dinero desde cualquier lugar." y tarjeta ilustrativa (Kyn Card,
  "5294 •••• •••• 4827", "STEVEN LUNA", "12/29").
- **Panel de formulario** (derecha): título "Crea tu cuenta", subtítulo "Completa tus datos para
  comenzar", campos "Nombre completo" (marcador "Ej: Diego Martínez"), "Correo electrónico"
  (marcador "tucorreo@ejemplo.com"), "Contraseña" y "Confirmar contraseña" (ambos con control de
  visibilidad), casilla "Acepto los términos y condiciones" (con "términos y condiciones" como
  enlace), botón "Crear cuenta", separador "o regístrate con", botones "Google" y "Apple", y pie
  "¿Ya tienes cuenta? Inicia sesión".

**Relación con otras funcionalidades**: complementa `001-login-billetera`. El enlace
"Regístrate" del login, hoy marcado como "Función no disponible en esta demostración" (001,
FR-016), pasa a abrir esta pantalla, y el enlace "Inicia sesión" de esta pantalla vuelve al
login.

## Clarifications

### Session 2026-10-19

- Q: Tras un registro exitoso, ¿a dónde se dirige al usuario? → A: Vuelve a la pantalla de
  inicio de sesión con el correo precargado; el usuario NO queda autenticado y debe iniciar
  sesión ingresando la contraseña que acaba de crear.
- Q: ¿Qué mensaje se muestra si el correo ya tiene una cuenta? → A: Un mensaje explícito: "Ya
  existe una cuenta con este correo".
- Q: ¿Qué reglas debe cumplir la contraseña en el registro? → A: La misma longitud del login
  (8 a 128 caracteres) y, además, al menos una mayúscula, un número o un símbolo (basta uno).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una cuenta con datos válidos (Priority: P1)

Como persona nueva en KynWallet, quiero registrarme con mi nombre, correo y contraseña, para
obtener una cuenta y poder ingresar a la billetera.

**Why this priority**: es el propósito central de la pantalla; sin este flujo no existe valor
demostrable.

**Independent Test**: se completan los cuatro campos con datos válidos, se aceptan los términos,
se presiona "Crear cuenta" y se verifica que se vuelve al login con el correo precargado y que el acceso
requiere la contraseña recién creada.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro cargada, **When** el usuario completa nombre, correo,
   contraseña y confirmación con datos válidos, acepta los términos y presiona "Crear cuenta",
   **Then** se crea la cuenta y se muestra la pantalla de inicio de sesión con el aviso
   "¡Listo, {nombre}! Tu cuenta fue creada. Inicia sesión con tu contraseña.", el correo
   registrado precargado, el campo de contraseña vacío y el foco en el campo de contraseña.
2. **Given** el usuario envió el formulario con datos válidos, **When** el registro simulado está
   en curso, **Then** el botón "Crear cuenta" muestra un estado de carga, queda deshabilitado y
   no admite envíos adicionales.
3. **Given** el login mostrado tras el registro, **When** el usuario ingresa la contraseña que
   acaba de crear y presiona "Iniciar sesión", **Then** accede a la vista de bienvenida de 001
   con su nombre; si ingresa otra contraseña, recibe el error genérico de 001 ("Correo o
   contraseña incorrectos"). El registro por sí solo NUNCA deja al usuario autenticado.
4. **Given** el usuario escribe el correo con mayúsculas o espacios al inicio o final, **When**
   se registra, **Then** el correo se guarda normalizado (sin espacios periféricos y en
   minúsculas).
5. **Given** el usuario está en cualquier campo del formulario, **When** presiona Enter,
   **Then** el formulario se envía igual que al presionar "Crear cuenta".

---

### User Story 2 - Validar los datos antes de crear la cuenta (Priority: P1)

Como usuario, quiero que el formulario me indique qué datos faltan o son incorrectos, para
corregirlos antes de registrarme.

**Why this priority**: en el registro la validación es parte del flujo principal: impide crear
cuentas con datos inválidos o contraseñas que el usuario no confirmó.

**Independent Test**: se envía el formulario vacío, luego con contraseñas que no coinciden y sin
aceptar términos, y se verifican los mensajes de cada campo.

**Acceptance Scenarios**:

1. **Given** todos los campos vacíos, **When** el usuario presiona "Crear cuenta", **Then** se
   muestran "Ingresa tu nombre completo", "Ingresa tu correo electrónico", "Ingresa una
   contraseña" y "Confirma tu contraseña" junto a cada campo, no se ejecuta el registro y el
   foco se mueve al primer campo con error.
2. **Given** un nombre con menos de 2 caracteres o con caracteres no permitidos (por ejemplo,
   dígitos o símbolos), **When** el usuario sale del campo o envía el formulario, **Then** se
   muestra "Ingresa un nombre válido".
3. **Given** un correo sin formato válido (por ejemplo, "usuario@" o "usuario.com"), **When** el
   usuario sale del campo o envía el formulario, **Then** se muestra "Ingresa un correo
   electrónico válido".
4. **Given** una contraseña con menos de 8 caracteres, **When** el usuario sale del campo o
   envía el formulario, **Then** se muestra "La contraseña debe tener al menos 8 caracteres".
5. **Given** una contraseña de 8 a 128 caracteres compuesta solo por minúsculas y espacios (por
   ejemplo, "clavesegura"), **When** el usuario sale del campo o envía el formulario, **Then**
   se muestra "La contraseña debe incluir al menos una mayúscula, un número o un símbolo" y no
   se ejecuta el registro.
6. **Given** una contraseña de 8 a 128 caracteres que incluye al menos una mayúscula, un número
   o un símbolo (por ejemplo, "Clavesegura", "clavesegura1" o "clave-segura"), **When** el
   usuario sale del campo, **Then** no se muestra ningún mensaje de validación de contraseña.
7. **Given** una confirmación distinta de la contraseña, **When** el usuario sale del campo de
   confirmación o envía el formulario, **Then** se muestra "Las contraseñas no coinciden".
8. **Given** la casilla de términos sin marcar, **When** el usuario presiona "Crear cuenta",
   **Then** se muestra "Debes aceptar los términos y condiciones" y no se ejecuta el registro.
9. **Given** un campo con mensaje de validación, **When** el usuario corrige el valor, **Then**
   el mensaje de ese campo desaparece; si cambia la contraseña, la validación de coincidencia
   de la confirmación se reevalúa.
10. **Given** un campo con error, **When** es leído por un lector de pantalla, **Then** se
   anuncia el mensaje de error asociado a ese campo.

---

### User Story 3 - Impedir el registro de un correo ya existente (Priority: P2)

Como usuario, quiero saber si el correo que ingresé ya tiene una cuenta, para iniciar sesión en
lugar de crear una cuenta duplicada.

**Why this priority**: evita cuentas duplicadas en la demostración, pero el flujo principal (P1)
es demostrable sin ella.

**Independent Test**: se intenta registrar el correo de una cuenta de demostración existente y
se verifica el mensaje y el acceso al login.

**Acceptance Scenarios**:

1. **Given** un correo que ya pertenece a una cuenta (de demostración o registrada en la sesión),
   **When** el usuario envía el formulario, **Then** no se crea la cuenta y se muestra "Ya
   existe una cuenta con este correo" junto al campo de correo, anunciado por tecnologías de
   asistencia, y el foco se mueve al campo de correo.
2. **Given** se muestra ese mensaje, **When** el usuario modifica el correo, **Then** el mensaje
   desaparece.
3. **Given** un intento rechazado por correo existente, **When** se muestra el mensaje, **Then**
   se conservan nombre y correo, y se vacían ambos campos de contraseña.

---

### User Story 4 - Mostrar u ocultar las contraseñas (Priority: P3)

Como usuario, quiero poder ver temporalmente la contraseña y su confirmación, para verificar
que las escribí correctamente.

**Why this priority**: mejora de conveniencia presente en el diseño, no imprescindible para el
registro.

**Independent Test**: se escriben ambas contraseñas, se activa cada control de visibilidad y se
verifica que cada campo se muestra y oculta de forma independiente.

**Acceptance Scenarios**:

1. **Given** una contraseña ingresada y oculta, **When** el usuario activa su control de
   visibilidad, **Then** solo ese campo se muestra en texto legible y el control indica
   "Ocultar contraseña".
2. **Given** el campo visible, **When** el usuario vuelve a activar el control, **Then** el campo
   se oculta y el control indica "Mostrar contraseña".
3. **Given** los controles de visibilidad, **When** el usuario los opera solo con teclado,
   **Then** puede alcanzarlos y activarlos, y su estado es anunciado por tecnologías de
   asistencia.

---

### User Story 5 - Navegar entre login y registro, y elementos fuera de alcance (Priority: P3)

Como usuario, quiero moverme entre las pantallas de inicio de sesión y registro, y que los
elementos del diseño no incluidos en la demostración me informen que no están disponibles.

**Why this priority**: conecta las dos pantallas y mantiene la fidelidad al diseño sin ampliar
el alcance funcional (YAGNI).

**Independent Test**: desde el login se activa "Regístrate" y se llega al registro; desde el
registro se activa "Inicia sesión" y se vuelve al login; se activan "términos y condiciones",
"Google" y "Apple" y se verifica el aviso.

**Acceptance Scenarios**:

1. **Given** la pantalla de inicio de sesión, **When** el usuario activa "Regístrate", **Then** se
   muestra la pantalla de registro con todos los campos vacíos.
2. **Given** la pantalla de registro, **When** el usuario activa "Inicia sesión", **Then** se
   muestra la pantalla de inicio de sesión y los datos del registro no se conservan.
3. **Given** la pantalla de registro, **When** el usuario activa "términos y condiciones",
   "Google" o "Apple", **Then** se muestra el aviso "Función no disponible en esta demostración"
   y la pantalla conserva los datos ingresados.

---

### Edge Cases

- El usuario presiona "Crear cuenta" varias veces seguidas: solo se procesa un intento.
- El nombre tiene espacios al inicio, al final o repetidos: se recortan y se colapsan antes de
  validar y mostrar.
- El nombre incluye tildes, "ñ", apóstrofos o guiones (por ejemplo, "María José O'Neill-Peña"):
  se acepta.
- La contraseña contiene espacios: se respetan tal cual, sin recortarlos.
- El usuario completa la confirmación antes que la contraseña: la coincidencia se evalúa al
  salir de cualquiera de los dos campos.
- Longitudes excesivas (nombre > 100, correo > 254, contraseña > 128 caracteres): se rechazan
  con mensaje de validación y no se ejecuta el registro.
- El usuario pega texto en los campos: se acepta y se valida igual que el texto escrito.
- El servicio de registro simulado no está disponible: se muestra "Servicio de registro no
  disponible. Intenta más tarde." sin exponer detalles internos.
- El usuario recarga la página tras registrarse: las cuentas creadas en la sesión se pierden
  (no hay persistencia).
- Ventana estrecha (dispositivo móvil): el formulario permanece completamente utilizable sin
  desplazamiento horizontal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla DEBE reproducir la estructura, textos y jerarquía visual del diseño de
  referencia de Figma (`04 · Registro`), reutilizando los componentes y tokens ya existentes del
  login (panel de marca, campos, botones, divisor, botones sociales).
- **FR-002**: La pantalla DEBE permitir ingresar nombre completo, correo electrónico, contraseña
  y confirmación de contraseña, y marcar la aceptación de términos y condiciones.
- **FR-003**: El sistema DEBE validar que el nombre sea obligatorio, tenga entre 2 y 100
  caracteres tras recortar espacios y contenga solo letras (incluidas tildes y "ñ"), espacios,
  apóstrofos y guiones.
- **FR-004**: El sistema DEBE validar el correo con las mismas reglas del login (obligatorio,
  formato válido, máximo 254 caracteres), usando una única fuente de esas reglas (Constitución
  4.1).
- **FR-005**: El sistema DEBE validar que la contraseña sea obligatoria y tenga entre 8 y 128
  caracteres, usando la misma regla de longitud del login (fuente única, Constitución 4.1).
- **FR-005a**: Además, en el registro la contraseña DEBE incluir al menos un carácter que sea
  una letra mayúscula, un dígito o un símbolo (cualquier carácter que no sea letra, dígito ni
  espacio); basta con cumplir uno de los tres. Si no se cumple, se DEBE mostrar "La contraseña
  debe incluir al menos una mayúscula, un número o un símbolo".
- **FR-005b**: La regla de FR-005a aplica solo a la creación de contraseñas en el registro; la
  validación del login (001) NO cambia y sigue verificando únicamente la longitud.
- **FR-006**: El sistema DEBE validar que la confirmación sea obligatoria y coincida exactamente
  con la contraseña.
- **FR-007**: El sistema DEBE exigir que la casilla de términos y condiciones esté marcada para
  crear la cuenta.
- **FR-008**: El sistema DEBE mostrar los mensajes de validación junto al campo correspondiente,
  al salir del campo y al intentar enviar, y DEBE ocultarlos cuando el valor se corrija.
- **FR-009**: El sistema NO DEBE ejecutar el registro mientras existan errores de validación.
- **FR-010**: El sistema DEBE simular el registro sin servicios backend ni base de datos; las
  cuentas creadas DEBEN conservarse solo en memoria durante la sesión del navegador.
- **FR-011**: El registro simulado DEBE incluir una espera breve (aprox. 1 segundo) con indicador
  de carga, durante la cual el envío queda deshabilitado.
- **FR-012**: El sistema DEBE rechazar el registro de un correo que ya pertenezca a una cuenta
  de demostración o a una cuenta creada en la sesión, comparando sin distinguir mayúsculas
  (tras normalizar), y DEBE mostrar "Ya existe una cuenta con este correo" junto al campo de
  correo.
- **FR-013**: Una cuenta creada en la sesión DEBE poder usarse para iniciar sesión en la pantalla
  de login (001) mientras la página no se recargue.
- **FR-014**: Tras un registro exitoso, el sistema DEBE mostrar la pantalla de inicio de sesión
  (001) con el correo registrado precargado (normalizado), el campo de contraseña vacío, un
  aviso de confirmación que incluya el nombre del usuario anunciado por tecnologías de
  asistencia, y el foco en el campo de contraseña.
- **FR-014a**: El registro NO DEBE autenticar al usuario: el acceso a la vista de bienvenida
  DEBE requerir que el usuario inicie sesión ingresando la contraseña recién creada, aplicando
  las mismas validaciones y el mismo mensaje de error genérico de 001.
- **FR-014b**: Ningún dato del formulario de registro distinto del correo (en particular, las
  contraseñas) DEBE transferirse ni conservarse en la pantalla de inicio de sesión. El aviso de
  confirmación DEBE desaparecer cuando el usuario modifique un campo o envíe el formulario.
- **FR-015**: El sistema NO DEBE registrar ni mostrar las contraseñas en mensajes, registros de
  diagnóstico, URL ni almacenamiento del navegador (Constitución 5.4).
- **FR-016**: Ambos campos de contraseña DEBEN ocultar los caracteres por defecto y ofrecer, cada
  uno, un control accesible e independiente para mostrarlos u ocultarlos.
- **FR-017**: El formulario DEBE poder enviarse con la tecla Enter y operarse completamente con
  teclado, con orden de foco lógico y foco visible.
- **FR-018**: La pantalla DEBE cumplir WCAG 2.1 nivel AA: etiquetas asociadas a cada campo,
  errores anunciados por tecnologías de asistencia, mensajes de resultado anunciados de forma
  automática y contraste suficiente.
- **FR-019**: El enlace "Regístrate" del login DEBE abrir esta pantalla (reemplaza el aviso de
  "no disponible" definido en 001 FR-016) y el enlace "Inicia sesión" DEBE volver al login.
- **FR-020**: Los elementos "términos y condiciones", "Google" y "Apple" DEBEN mostrarse según el
  diseño y, al activarse, informar "Función no disponible en esta demostración".
- **FR-021**: La pantalla DEBE adaptarse a anchos desde 320 px hasta escritorio sin
  desplazamiento horizontal; en anchos reducidos el panel de marca puede simplificarse u
  ocultarse manteniendo el logo visible, igual que en el login.
- **FR-022**: Los errores inesperados DEBEN mostrarse con un mensaje comprensible para el
  usuario, sin revelar detalles técnicos.

### Key Entities

- **Solicitud de registro**: datos ingresados en el formulario (nombre completo, correo,
  contraseña, confirmación y aceptación de términos) y su resultado: error de validación, correo
  ya registrado o registro exitoso. No se persiste.
- **Cuenta**: usuario habilitado para iniciar sesión. Atributos: correo (identificador único, sin
  distinguir mayúsculas), contraseña y nombre del titular. Proviene de la configuración de
  demostración (001) o se crea en la sesión mediante este registro; las creadas en la sesión
  viven solo en memoria.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario nuevo completa el registro en menos de 60 segundos desde que la pantalla
  se muestra.
- **SC-002**: El resultado de un intento (confirmación o error) se muestra en un máximo de 2
  segundos tras presionar "Crear cuenta".
- **SC-003**: El 100 % de los escenarios de aceptación de las historias P1 y P2 se verifican
  mediante pruebas automatizadas que pasan.
- **SC-004**: Una cuenta recién creada permite iniciar sesión en el login en el 100 % de los
  casos durante la misma sesión.
- **SC-005**: El 90 % de los participantes de una prueba de usabilidad completa el registro en el
  primer intento sin asistencia.
- **SC-006**: La pantalla no presenta incumplimientos WCAG 2.1 AA en una auditoría automatizada
  de accesibilidad y es operable solo con teclado.
- **SC-007**: La revisión visual frente al diseño de Figma no detecta diferencias en textos,
  orden de elementos ni jerarquía visual.
- **SC-008**: El análisis de secretos no detecta credenciales en el código fuente versionado.

## Assumptions

- La demostración sigue siendo exclusivamente del lado del cliente: no hay backend, base de
  datos, verificación por correo ni sesión persistente; recargar la página descarta las cuentas
  creadas.
- Se reutilizan las reglas de validación, componentes de interfaz y tokens de diseño del login
  (001); esta funcionalidad no introduce un sistema de diseño nuevo.
- Los textos de los mensajes de validación siguen el tono de 001 y pueden ajustarse en la
  revisión sin cambiar el comportamiento.
- El contenido de "términos y condiciones", el registro con Google/Apple, la verificación de
  correo y la recuperación de contraseña quedan fuera del alcance; sus elementos se muestran solo
  por fidelidad al diseño.
- El idioma de la interfaz es español.
- El mensaje explícito ante correo ya registrado revela que el correo existe. Es una decisión
  aceptada en la revisión por usabilidad para esta demostración, y difiere a propósito del
  mensaje genérico del login (001 FR-010), que no cambia. Si la funcionalidad pasa a un entorno
  real, esta decisión DEBE revisarse con el responsable de seguridad (Constitución, Principio V).
- No existen BRD ni ARD para esta funcionalidad; si se incorporan, esta especificación DEBE
  alinearse con ellos (Constitución, Principio VI).
- El diseño de referencia corresponde a escritorio (1440 × 1024); la adaptación a móvil se
  deriva del mismo diseño y del comportamiento ya definido para el login.
