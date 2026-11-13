# Testing

Comando de este repo: `npm test` (`vitest run`). Integración, cuando el cambio la tenga: `npm run test:integration`.

- Todo cambio de comportamiento lleva test en el runner que ya existe. Un bugfix empieza por el test que reproduce el fallo.
- Las utilidades puras (`src/workspace/*.util.ts`, `src/auth/tenant-session.ts`) se prueban sin levantar Postgres.
- No marques listo si el comando no corrió. Reporta el comando y el resultado. Un error de sandbox al matar workers, después de que los tests pasaron, se distingue del fallo del test.
- No declares cobertura de integración si solo corriste la suite unitaria.
- No añadas un segundo runner. Si hace falta un tipo de test que Vitest no cubre hoy, se pregunta antes de introducir el framework.
