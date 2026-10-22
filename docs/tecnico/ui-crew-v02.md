# UI Crew — alineación V02 + Anexo lámina 02



Referencias: `HAVECTRL_V02_Crew.pdf`, lámina 02 del Anexo Visual.



Documentación completa (APIs, grupos Data, código): copia en `havectrl-frontend/docs/tecnico/ui-crew-v02.md` y en `/docs/tecnico/ui-crew-v02.md` del monorepo local.



**Cierre 1A:** `/docs/tecnico/crew-cierre-1a.md` (monorepo). Módulo Crew cerrado para el hito base.

Resumen backend:



- Tabla `crew.worker_documents` — migración `007_crew_worker_documents.sql`.

- Rutas: `POST /crew/:id/documents`, `PUT|DELETE /crew/documents/:documentId`.

- `GET /crew/:id` incluye `documents[]` y metadatos de `files[]` (`module=crew`).

