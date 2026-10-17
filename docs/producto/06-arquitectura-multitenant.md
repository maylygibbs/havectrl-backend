# Arquitectura y multitenant

Un frontend, un backend y varias bases Postgres. El tenant es el hostname. El backend decide qué compañía atiende. El frontend no elige el cliente.

## Piezas

```
demoa.localhost:5174  →  React (1 build)
                         Origin + Bearer JWT
                              │
                              ▼
                       NestJS + Fastify :3100
                         hostname → ConfigRegistry
                         pool de la base del tenant
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        havectrl_central                  demoa | demob | …
        hostname → conexión               identidad, operación, branding
```

| Pieza | Dónde | Rol |
| --- | --- | --- |
| Frontend | `havectrl-frontend` | Un build de React y Vite para todas las compañías |
| Backend | `havectrl-backend` | NestJS con Fastify. Autoriza y abre la base correcta |
| Base central | `havectrl_central` | Registro de hostnames y conexión de cada cliente |
| Base del tenant | mismo nombre que el cliente (`demoa`, `demob`) | Datos de esa compañía |

No hay carpeta, build ni proceso por cliente. Un despliegue sirve a todos los subdominios.

## Cómo se reconoce al cliente

En cada request el backend toma el primer hostname válido de esta lista:

1. `Origin`
2. `Referer`
3. `X-Forwarded-Host`
4. `Host`

Ese hostname se busca en `havectrl_central.configs`, fila `config_name = 'default'`, dentro de `config_data.contextModules.domains`. Si no está, el request no tiene tenant. El cuerpo, un query param o un header inventado por el cliente no eligen la compañía.

`ConfigRegistry` carga ese mapa al arrancar y guarda un pool de Postgres por slug. Las consultas de operación usan ese pool, no la base central.

La tabla `tenants` de la central es el espejo relacional (slug, hostname, `db_name`). El nombre de la base es el del cliente.

## Sesión

El login ocurre ya con el tenant resuelto. El usuario se busca en la base de esa compañía. El JWT lleva `tenantId` igual al slug. En las rutas protegidas el slug del token tiene que coincidir con el hostname del request. Una sesión de `demoa` presentada en `demob` se rechaza.

La sesión del navegador vive en `sessionStorage` de ese origen. `demoa.localhost` y `demob.localhost` no comparten sesión.

## Branding

El branding de cada compañía está en su base, tabla `branding` (una fila): nombre visible, frase, marca corta, logo y colores.

`GET /common/domain/config` resuelve el hostname y lee esa fila. El front la aplica al cargar, antes del login. Un hostname desconocido responde `ok: false` y no muestra datos de otro cliente.

La marca de la plataforma sigue siendo HAVECTRL. El logo del operador, cuando exista, entra en los documentos exportados. Pintar toda la aplicación con el color del tenant está en pausa: ver la duda 2 en [05-dudas.md](05-dudas.md).

## Migraciones

Los cambios de esquema son archivos SQL ordenados. No se altera una base a mano ni se edita una migración ya aplicada.

| Carpeta | Base |
| --- | --- |
| `migrations/central` | `havectrl_central` |
| `migrations/tenant` | cada base de cliente |

Cada base tiene `schema_migrations` con la versión aplicada. `npm run db:migrate` recorre la central y, con el registro ya cargado, cada base de tenant. `npm run db:setup` migra y deja los clientes de prueba.

Un cambio de columnas de operación se escribe en `migrations/tenant`. Un cambio del registro de compañías se escribe en `migrations/central`.

## Qué no cruza la frontera

- Una consulta, un archivo, una búsqueda o una exportación quedan en la base del hostname resuelto.
- El administrador de una compañía no administra a las demás.
- Los secretos de conexión y el `JWT_SECRET` viven en el entorno, no en el repositorio ni en la respuesta del API.
- El front no guarda credenciales de Postgres ni de un proveedor aeronáutico.
