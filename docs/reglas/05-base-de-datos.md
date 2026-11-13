# Base de datos

- Central: `migrations/central/`. Cada cliente: `migrations/tenant/`. Lo aplicado queda en `schema_migrations`.
- Un cambio de columnas es un archivo SQL nuevo. No se edita una migración que ya pudo aplicarse. No se altera producción a mano.
- `npm run db:migrate` aplica pendientes. `npm run db:setup` crea bases que falten, migra y carga demo; no tira bases existentes.
- Valida el nombre de base antes de interpolarlo en un `CREATE DATABASE` o en un DSN.
- Las tablas de datos del tenant llevan `deleted_at`. Los listados excluyen filas con `deleted_at` no nulo. El historial operativo no se borra en duro.
- Fechas con zona y UTC. Duraciones en minutos o segundos enteros. Contadores de célula, motor y hélice no se mezclan. El detalle de producto está en `docs/producto/02-reglas-transversales.md`.

La conexión de la central sale de `CENTRAL_DB_*` en el entorno. No copies contraseñas al repositorio ni a este documento.
