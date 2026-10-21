# Avance de la iteracion 1

Registro tecnico de lo ya entregado en codigo. No sustituye el corte de [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md).

## Soft delete

Todas las tablas de datos del tenant llevan `deleted_at timestamptz` (migracion `004_soft_delete_and_locale.sql`). Los listados y los conteos de Home filtran `WHERE deleted_at IS NULL`.

Borrar un trabajador de Crew pone `deleted_at = now()`, marca `status = 'inactive'` y desactiva en cascada logica sus `assignments` y `experience`. El registro permanece en la base.

## Idioma

`identity.users.preferred_language` admite `en` (por defecto) o `es`. El login y `GET /auth/me` lo devuelven. `PATCH /settings/language` lo actualiza para cualquier perfil autenticado (no exige el modulo Settings).

## Crew CRUD

| Metodo | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/crew` | Lista vivos |
| `GET` | `/crew/:id` | Detalle + asignaciones + experiencia |
| `POST` | `/crew` | Alta |
| `PUT` | `/crew/:id` | Edicion parcial |
| `DELETE` | `/crew/:id` | Soft delete |

## Marca de la aplicacion

Logo HAVECTRL fijo en el frontend. Cada tenant aplica `primary_color` y `accent_color` de su tabla `branding` a acentos, botones y barra superior (opcion B de la duda 2). El logo del operador queda para PDF exportados.

## Home alineado al Anexo Visual

El shell usa sidebar oscura con iconos, contenido claro, busqueda y reloj. Home muestra hero con frase de marca, cards por modulo permitido, vuelos del dia operativo, donut de flota, actividad reciente y barra de estado del sistema. Fuente visual: `HAVECTRL_Anexo_Visual.pdf` lamina Home. La foto del hero vive en `havectrl-frontend/public/heroes/hero-home.png` (Beechcraft del anexo); banners de modulos salen del pack en `design-assets/marketing/`. El texto se superpone para poder traducir EN/ES.

## Modulos montados al Anexo Visual

Todas las pantallas principales siguen las 12 laminas del anexo: heroes por modulo (`public/heroes/`), tabs (Crew/Aircraft/Flights/Operations/Maintenance/Communication/Settings) y layouts master-detail donde el anexo lo indica. Detalle tecnico en `/docs/tecnico/ui-anexo-visual.md` y criterio de negocio en `/docs/negocio/ui-modulos.md`. Las laminas extraidas viven en `design-assets/anexo-laminas/` (no se sirven en runtime).

## Assets de marketing (2026-10-21)

Pack oficial integrado en `havectrl-frontend/public/` (heroes + logos) y archivado en `design-assets/marketing/source-pack-20261021/`. Mapeo en `design-assets/marketing/README.md`.

## Iteracion 1A (en curso)

- Detalle de Crew y Aircraft devuelto en forma plana para la UI (assignments, experience, documents, discrepancies, flights).
- Schedule manual: `GET/POST/DELETE` en `/crew/assignments` y `/crew/:id/assignments`.
- Settings: `GET /settings/company` (branding del tenant).
- Matriz de acceso cubierta por `access.spec.ts`.
- Checklist vivo: `/docs/tecnico/iteracion-1a-checklist.md`.

## Pruebas

`npm test` (Vitest) cubre normalizacion de Crew, mapeo de unicidad Postgres y matriz de acceso (SMS reservado, modulos por perfil).
