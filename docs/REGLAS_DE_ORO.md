# Reglas de oro

Aplican a todo PR de este repo. El detalle está en `docs/reglas/`. No copies este texto a `AGENTS.md` ni a `.cursor/rules/`.

1. **No versionar secretos.** `.env`, `JWT_SECRET`, contraseñas, cadenas de conexión y dumps quedan fuera de git. `.env.example` solo lleva placeholders. Si un secreto llegó a un remoto, se rota.
2. **Una instancia, muchos clientes.** El mismo proceso atiende a todos los hostnames de `havectrl_central`. Nada de `if (cliente === 'x')` en código compartido: la diferencia vive en la config del tenant.
3. **Fail-closed.** Un perfil que no está en el mapa de módulos no recibe ninguno. Un módulo nuevo no se enciende solo.
4. **Sin default a un cliente real.** Un override de hostname o de tenant de prueba solo puede existir fuera de producción y con variable de entorno explícita. No se añade un fallback a `demoa`, `demob` ni a otro slug.
5. **El request no elige la compañía.** Hostname (`Origin`, luego `Referer`, `X-Forwarded-Host`, `Host`) y JWT `tenantId` tienen que ser el mismo tenant.
6. **El test acompaña al cambio.** Un bugfix empieza por un test que falla. No se declara listo sin `npm test` (y `npm run build` cuando el diff lo exige), con el resultado dicho.
7. **Un PR, una frase.** No se cuela infra transversal (migraciones de todos los tenants, cambio de auth, cambio de pool) dentro de un PR de una pantalla. Si entra, el PR lo dice.
8. **Docs de reglas solo en `docs/`.** `AGENTS.md` y `.mdc` resumen y enlazan.
9. **Nada de push directo a `main`.** El merge lo hace una persona.
10. **No cerrar dudas de producto en un PR de código.** Si el manual y el resumen chocan, manda `docs/producto/04-apis-e-iteraciones.md`. Si la duda sigue abierta, manda la opción estrecha de `docs/producto/05-dudas.md`.
