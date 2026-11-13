# Principios

Fuente de review: `docs/REGLAS_DE_ORO.md`. Producto: `docs/producto/`.

1. **Una instancia, muchos clientes.** `ConfigRegistry` abre el pool del hostname resuelto. La diferencia entre clientes es fila de `havectrl_central` y datos de su base, no una rama en el código.
2. **Retrocompatibilidad del contrato.** Un campo que el front ya lee no se renombra ni se vacía en silencio. Un cambio que rompe el JSON va en su propio PR.
3. **El test primero cuando se corrige un fallo.** El test nuevo tiene que fallar antes del arreglo y pasar después. `npm test` es Vitest (`vitest run`).
4. **La convención de este repo manda.** NestJS + Fastify, TypeScript estricto, SQL en `migrations/`, utilidades puras con `*.spec.ts` al lado.
5. **Fail-closed.** `modulesFor` y `assertModule` niegan lo que no está en el mapa. No añadas un `default` que conceda un módulo.

Alcance de un PR: una frase alcanza para decir qué cambia. Una migración que toca todas las bases, un cambio de guard o un cambio de resolución de tenant no viaja escondido en un fix de pantalla.
