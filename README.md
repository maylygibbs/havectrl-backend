# havectrl-backend

API de HaveCtrl. NestJS 11 sobre Fastify, en TypeScript. Resuelve qué compañía hace el request y abre la base de ese cliente.

## Tenancy

El tenant sale de `Origin`, luego `Referer`, `X-Forwarded-Host` y `Host`. Solo se acepta un hostname registrado en `havectrl_central`. `ConfigRegistry` mantiene el pool de la base del tenant. El JWT queda anclado a ese slug: una sesión de `demoa` no vale en `demob`.

Hay una base central y una base por cliente. El nombre de la base es el del cliente (`demoa`, `demob`).

## Requisitos

Node 22 y Postgres en `localhost:5432`.

```bash
cp .env.example .env
npm install
npm run db:setup
npm run start:dev
```

El API queda en `http://127.0.0.1:3100`.

## Base de datos

Un solo comando crea todo. Postgres tiene que estar en marcha y el usuario de `.env` debe poder crear bases.

```bash
cp .env.example .env
npm install
npm run db:setup
```

Eso ejecuta `scripts/setup-db.mjs` y deja tres bases:

| Base | Qué contiene |
| --- | --- |
| `havectrl_central` | Registro de hostnames. `demoa.localhost` apunta a `demoa` y `demob.localhost` apunta a `demob` |
| `demoa` | Esquema del cliente y datos de demostración de Demo A |
| `demob` | Esquema del cliente y datos de demostración de Demo B |

El nombre de la central sale de `CENTRAL_DB_NAME`. Si el archivo `.env` no existe, el valor es `havectrl_central`. Se puede volver a ejecutar: no duplica usuarios, vuelos ni gastos.

| Variable | Uso |
| --- | --- |
| `CENTRAL_DB_HOST` | Host de Postgres |
| `CENTRAL_DB_PORT` | Puerto |
| `CENTRAL_DB_USER` | Usuario |
| `CENTRAL_DB_PASSWORD` | Contraseña |
| `CENTRAL_DB_NAME` | Base central. Por defecto `havectrl_central` |
| `JWT_SECRET` | Firma de la sesión |
| `PORT` | Puerto del API. Por defecto `3100` |

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run start:dev` | Arranca en modo observación |
| `npm run build` | Compila a `dist/` |
| `npm run start` | Arranca la compilación |
| `npm run db:migrate` | Aplica migraciones pendientes de la central y de cada tenant registrado |
| `npm run db:seed` | Igual que `db:setup`: registra los clientes y carga los datos de demostración |
| `npm run db:setup` | Crea `havectrl_central`, `demoa` y `demob`, migra y carga los datos de demostración |

Las migraciones viven en `migrations/central` y `migrations/tenant`. Cada base guarda lo ya aplicado en `schema_migrations`.

## Clientes de prueba

| Hostname | Base | Correo | Contraseña |
| --- | --- | --- | --- |
| `demoa.localhost` | `demoa` | `admin@demoa.local` | `havectrl-demo` |
| `demob.localhost` | `demob` | `admin@demob.local` | `havectrl-demo` |

El front manda el `Origin`. Para probar el API solo:

```bash
curl -H 'Origin: http://demoa.localhost:5174' http://127.0.0.1:3100/common/domain/config
```

## Rutas actuales

| Método | Ruta | Qué hace |
| --- | --- | --- |
| `GET` | `/health` | Proceso vivo |
| `GET` | `/ready` | Tenants cargados desde la central |
| `GET` | `/common/domain/config` | Compañía y branding del hostname |
| `POST` | `/auth/login` | Sesión si el usuario existe en la base de ese tenant |
| `GET` | `/auth/me` | Sesión vigente, anclada al hostname |
| `GET` | `/crew` | Tripulación activa |
| `POST` | `/crew` | Alta de trabajador |
| `PUT` | `/crew/:id` | Edición |
| `DELETE` | `/crew/:id` | Soft delete |
| `PATCH` | `/settings/language` | Preferencia `en` / `es` |

## Pruebas

```bash
npm test
```

## Documentación

La arquitectura y el multitenant están en `docs/producto/06-arquitectura-multitenant.md`. El resto de la especificación está en `docs/producto/`. Las reglas de implementación están en `AGENTS.md`.
