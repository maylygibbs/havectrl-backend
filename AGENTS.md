# HaveCtrl backend

API de HaveCtrl. NestJS 11 sobre Fastify, TypeScript estricto, Postgres. Una base central (`havectrl_central`) y una base por cliente. El tenant sale del hostname del request, no del cuerpo.

La ley de producto y las dudas abiertas están en `docs/producto/`. Este archivo no las cierra. Reglas de review: `docs/REGLAS_DE_ORO.md`. Detalle: `docs/reglas/`. Los `.cursor/rules/*.mdc` solo enlazan.

## Comandos

Node 22. Secretos en `.env` (plantilla `.env.example`); no se versionan.

- `npm run start:dev` — observa y sirve el `PORT` del entorno
- `npm run build` — compila a `dist/`
- `npm test` — Vitest
- `npm run test:integration` — Vitest de integración
- `npm run db:migrate` — aplica SQL pendiente
- `npm run db:setup` — crea la central y los clientes de demo, migra y carga datos. No borra bases ya existentes

## Reglas duras

1. Secretos solo en entorno. Si uno llegó a un remoto, se rota; borrarlo del árbol no basta.
2. Un proceso, muchos clientes. Sin ramas `if (cliente === '…')` en código compartido.
3. Perfil o módulo no concedido queda denegado (`src/access.ts`).
4. El JWT `tenantId` tiene que coincidir con el hostname resuelto. El cuerpo no elige la compañía.
5. Cambio de esquema = archivo nuevo en `migrations/central` o `migrations/tenant`. No se reescribe una migración ya aplicada.
6. Todo cambio entra por PR. No hay push directo a `main`.
7. No se declara listo sin correr el comando de test de este repo y reportar el resultado.

## Cómo verificar listo

`npm test` en verde. Si el diff toca compilación, controladores, tenancy o SQL, también `npm run build`. Un test saltado no cuenta como listo.
