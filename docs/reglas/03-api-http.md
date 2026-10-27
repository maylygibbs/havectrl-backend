# API y HTTP

NestJS con Fastify. Cada ruta de módulo pasa por el guard de sesión y por `assertModule` antes de leer o escribir.

- El controlador es delgado. La regla de negocio que se pueda probar sin HTTP vive en un `*.util.ts`.
- Un guardado que falló no responde éxito. Repetir la misma operación no duplica gasto, firma ni horas: el caso concreto está en `docs/producto/02-reglas-transversales.md`.
- No devuelvas claves, hashes ni cadenas de conexión.
- Identificadores que arman SQL se validan antes de interpolarlos.
- Textos de error orientados al usuario salen del idioma de la cuenta. No traduzcas códigos oficiales (FPL, DLA, CHG, CNL, METAR, NOTAM, matrículas).
- No nombres proveedores de mapas, meteorología o seguimiento en el dominio. Eso, cuando exista, queda detrás de un puerto.

Rutas y métodos nuevos se documentan en el PR. No dependas de un método HTTP implícito.
