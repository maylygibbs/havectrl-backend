# Estructura

- `src/auth/` — JWT y coincidencia de sesión con el tenant.
- `src/tenancy/` — hostname, `ConfigRegistry`, middleware.
- `src/access.ts` — mapa perfil → módulos. Es el único sitio donde se concede un módulo.
- `src/workspace/` — HTTP de los módulos y utilidades puras con su `*.spec.ts`.
- `src/db/` — lectura de entorno de la base central. No pongas secretos nuevos aquí.
- `migrations/central/` y `migrations/tenant/` — esquema. `scripts/` — migrate, seed, setup.
- `docs/producto/` — ley de producto. `docs/reglas/` — ley de agentes. `docs/tecnico/` y `docs/negocio/` — notas de iteración, no sustituyen a las dos anteriores.

Un archivo nuevo de dominio sigue la carpeta del módulo que ya existe. No abras `src/features/` ni un paquete paralelo.
