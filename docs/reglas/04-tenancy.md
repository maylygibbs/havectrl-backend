# Tenancy

Implementación: `src/tenancy/resolve-hostname.ts`, `src/tenancy/config-registry.ts`, `src/auth/tenant-session.ts`.

1. El hostname se lee en este orden: `Origin`, `Referer`, `X-Forwarded-Host`, `Host`.
2. Solo entra un hostname presente en `havectrl_central`. Si no está, no hay tenant.
3. `ConfigRegistry` abre el pool de esa fila. El cuerpo del request no elige base ni slug.
4. El JWT lleva `tenantId`. `assertTenantSession` rechaza la sesión si no coincide con el slug resuelto, también cuando el slug es nulo.
5. Una sesión de un cliente no se reutiliza en otro hostname.

No añadas un mapa en código de hostname de prueba → cliente. Los clientes de demo (`demoa`, `demob`) se registran en la central por el script de setup, no con un `if` en el resolver.

No existe hoy una variable de entorno que fuerce un tenant. No la inventes en un PR de feature. Si hace falta un override local, tiene que ser explícito, inactivo en producción y sin default a un slug real.
