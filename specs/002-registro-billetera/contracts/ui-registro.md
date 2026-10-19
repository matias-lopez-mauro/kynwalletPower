# Contract: Interfaz de usuario de la pantalla de registro

Contrato observable por el usuario y por las pruebas (RTL consulta por rol y nombre accesible).
Textos exactos en español, tal como figuran en el diseño de Figma (nodo `31:2`) y en la spec.

## Vista de registro

| Elemento | Rol / nombre accesible | Notas |
|---|---|---|
| Título | `heading` nivel 1 "Crea tu cuenta" | Subtítulo "Completa tus datos para comenzar" |
| Nombre | `textbox` "Nombre completo" | `autocomplete=name`, placeholder "Ej: Diego Martínez" |
| Correo | `textbox` "Correo electrónico" | `type=email`, `autocomplete=email`, placeholder "tucorreo@ejemplo.com" |
| Contraseña | campo con etiqueta "Contraseña" | `type=password` (o `text` si es visible), `autocomplete=new-password` |
| Confirmación | campo con etiqueta "Confirmar contraseña" | Igual que la contraseña |
| Visibilidad | dos `button` "Mostrar contraseña" / "Ocultar contraseña", uno por campo | `aria-pressed` refleja el estado; cada uno es independiente (FR-016) |
| Términos | `checkbox` con nombre "Acepto los términos y condiciones" | El error se vincula con `aria-describedby` |
| Ver términos | `button` "términos y condiciones" | Muestra el aviso de función no disponible |
| Enviar | `button` "Crear cuenta" | En carga: `aria-busy=true`, deshabilitado, texto "Creando cuenta…" |
| Separador | texto "o regístrate con" | Decorativo |
| Google / Apple | `button` "Google", `button` "Apple" | Muestran el aviso |
| Ir al login | `button` "Inicia sesión" precedido por "¿Ya tienes cuenta?" | Vuelve al login vacío (US5-2) |

**Errores por campo**: texto bajo el campo, vinculado con `aria-describedby`; el campo lleva
`aria-invalid=true`. "Ya existe una cuenta con este correo" se muestra como error del campo de
correo.

**Mensajes globales**:

| Caso | Rol | Texto |
|---|---|---|
| No disponible | `alert` | "Servicio de registro no disponible. Intenta más tarde." |
| Función fuera de alcance | `status` | "Función no disponible en esta demostración" |

## Panel de marca

Igual que en el login, salvo dos textos: el titular "Comienza tu camino financiero." y el
texto de apoyo "Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero
desde cualquier lugar.". La tarjeta es decorativa (`aria-hidden=true`). Por debajo de 960 px
solo se muestra el logo.

## Teclado

Orden de tabulación: nombre → correo → contraseña → visibilidad → confirmación → visibilidad →
términos (casilla) → términos y condiciones → crear cuenta → Google → Apple → inicia sesión.
Enter en cualquier campo de texto envía el formulario. El foco siempre es visible.

## Cambios al contrato de UI del login (001)

Modifica [001 ui-login.md](../../001-login-billetera/contracts/ui-login.md):

| Elemento | Antes | Ahora |
|---|---|---|
| `button` "Regístrate" | Muestra el aviso de función no disponible | Abre la vista de registro con los campos vacíos (FR-019) |
| Aviso de cuenta creada | — | `status` "¡Listo, {nombre}! Tu cuenta fue creada. Inicia sesión con tu contraseña.", visible al volver del registro; desaparece al editar un campo o al enviar |
| Correo | Vacío al cargar | Precargado con el correo registrado al volver del registro |
| Foco inicial | Sin foco forzado | Campo de contraseña al volver del registro (FR-014) |
