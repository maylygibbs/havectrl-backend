# Seguridad y secretos

- `.gitignore` ignora `.env` y `.env.*`, y deja pasar `.env.example`. No relajes eso.
- `JWT_SECRET`, contraseñas de Postgres y cualquier token de proveedor viven en entorno o bóveda. No en el repo, no en la respuesta HTTP, no en un log.
- Si un secreto se subió a un remoto, rotarlo. Borrar el archivo en un commit posterior deja el valor en el historial.
- No amplíes el fallback de `src/db/env.ts` con otra credencial ni con el slug de un cliente.
- Autorización: `assertModule` en cada consulta, cambio, archivo, búsqueda y exportación. Ocultar un campo no sustituye al guard.
- Hasta que `docs/producto/05-dudas.md` cierre la duda 1, la lectura del expediente SMS original sigue la opción estrecha ya escrita ahí (administrador y jefe de SMS). No abras esa lista en un PR.
- El anónimo de SMS no guarda metadatos que identifiquen al autor. Eso ya está en `docs/producto/`; no lo relajes.
