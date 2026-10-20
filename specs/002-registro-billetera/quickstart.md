# Quickstart: Pantalla de Registro de KynWallet

Guía para validar el registro de punta a punta. Prerrequisitos, configuración y comandos son los
de [001 quickstart.md](../001-login-billetera/quickstart.md): `npm install`,
`cp .env.example .env.local` con `VITE_DEMO_USERS` definido, y `npm run dev`.

## Verificar calidad (Constitución 9.4)

```bash
npm run verify     # lint, format, typecheck, test:coverage, build, audit:deps, audit:licenses, scan:secrets
```

Resultado esperado: todos los pasos terminan con código 0 y la cobertura es ≥ 80 %.

## Escenarios de validación manual

Siendo `<demo>` el correo de una cuenta definida en `.env.local`:

| # | Acción | Resultado esperado | Spec |
|---|---|---|---|
| 1 | En el login, presionar "Regístrate" | Se muestra "Crea tu cuenta" con los campos vacíos | US5-1, FR-019 |
| 2 | Completar "Ana Pérez", "  Ana@Ejemplo.com ", "Clavesegura" dos veces, aceptar términos y presionar "Crear cuenta" | Botón en carga ~1 s; luego el login con "ana@ejemplo.com" precargado, contraseña vacía y con el foco, y el aviso "¡Listo, Ana Pérez! …" | US1-1, US1-2, US1-4 |
| 3 | En ese login, ingresar "Clavesegura" y presionar "Iniciar sesión" | "¡Bienvenido, Ana Pérez!" | US1-3, SC-004 |
| 4 | Repetir 2–3 con una contraseña incorrecta en el paso 3 | "Correo o contraseña incorrectos" | US1-3 |
| 5 | Registrarse con `<demo>` (o con "ANA@ejemplo.com" tras el paso 2) | "Ya existe una cuenta con este correo" en el correo; contraseñas vacías; foco en el correo | US3-1, US3-3 |
| 6 | Presionar "Crear cuenta" con todo vacío | Errores en los 5 controles; foco en el nombre | US2-1, US2-8 |
| 7 | Nombre "A" o "Ana2" | "Ingresa un nombre válido" | US2-2 |
| 8 | Contraseña "clavesegura" | "La contraseña debe incluir al menos una mayúscula, un número o un símbolo" | US2-5, FR-005a |
| 9 | Contraseñas "clavesegura1" y "clave-segura" | Sin error de contraseña | US2-6 |
| 10 | Confirmación distinta | "Las contraseñas no coinciden"; al corregir la contraseña se reevalúa | US2-7, US2-9 |
| 11 | Activar cada icono de visibilidad | Cada campo se muestra y oculta por separado | US4 |
| 12 | Presionar "términos y condiciones" | "Función no disponible en esta demostración"; datos conservados | US5-3 |
| 12b | Presionar Google o Apple | "Próximamente"; datos conservados | US5-4, FR-020a |
| 13 | Presionar "Inicia sesión" con datos escritos | Login vacío; al volver al registro, los campos están vacíos | US5-2 |
| 14 | Recargar tras el paso 2 e iniciar sesión con la cuenta creada | "Correo o contraseña incorrectos" (no hay persistencia) | Caso límite |
| 15 | Borrar `VITE_DEMO_USERS`, reiniciar y registrarse | "Servicio de registro no disponible. Intenta más tarde." | Caso límite |
| 16 | Ventana de 320 px; recorrer con Tab y Enter | Sin scroll horizontal; orden según [contracts/ui-registro.md](./contracts/ui-registro.md#teclado) | FR-017, FR-021 |
