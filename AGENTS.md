# HaveCtrl backend

Ley de implementación. El detalle de producto está en `docs/producto/`. La arquitectura y el multitenant están en [06-arquitectura-multitenant.md](docs/producto/06-arquitectura-multitenant.md). Si un manual y el resumen MVP chocan, manda [04-apis-e-iteraciones.md](docs/producto/04-apis-e-iteraciones.md). Si una duda sigue abierta, manda la opción estrecha de [05-dudas.md](docs/producto/05-dudas.md). No inventes el cierre.

## Tenancy

El tenant sale del request: `Origin`, luego `Referer`, `X-Forwarded-Host`, luego `Host`. Solo vale un hostname que esté en `havectrl_central`. `ConfigRegistry` abre el pool de la base de ese cliente. La base se llama igual que el cliente (`demoa`, `demob`).

El JWT lleva el slug del tenant y tiene que coincidir con el hostname resuelto. Una sesión de un cliente no sirve en otro. El cuerpo del request no elige la compañía.

Secretos de conexión, JWT y proveedores viven en entorno o bóveda, no en el repositorio ni en la respuesta.

## Datos

Un registro, un identificador, una compañía. Aircraft, Flights y Maintenance leen el mismo expediente. El gasto se crea solo en Operations Services.

Esquema nuevo o cambio de columnas: archivo SQL en `migrations/central` o `migrations/tenant`, aplicado por `schema_migrations`. No se altera producción a mano ni se reescribe una migración ya aplicada.

Vacío no es cero. Fecha con zona y UTC. Duración en minutos o segundos enteros. Contadores de célula, motor y hélice no se mezclan.

Confirmar un LOG suma horas, ciclos y experiencia una vez. Reintentar no suma de nuevo. Corregir aplica la diferencia y guarda el valor anterior. Planificación y seguimiento no mueven horas reales.

Borrador, enviado y firmado son estados distintos. Corregir un firmado crea versión. Nadie firma con la identidad de otro. Cerrar tarea, cerrar discrepancia y liberar la aeronave son acciones distintas. La liberación exige habilitación vigente, no el cargo.

## Autorización

El servidor autoriza cada consulta, cambio, archivo, búsqueda y exportación. El rol se niega si no fue concedido. Duplicar un rol no concede Flight Tracking ni la lectura del SMS reservado.

Hasta cerrar la duda 1, el expediente original de SMS lo leen solo el administrador y el jefe de SMS. El resto puede reportar. El anónimo no guarda metadatos que identifiquen al autor. Búsqueda, listados, Home y exportaciones obedecen esa reserva.

Flight Tracking no existe en la iteración 1. Cuando exista, solo administrador y jefe de pilotos, y el permiso se comprueba antes de pedir telemetría.

## Iteración 1

No integrar Mapbox, ADS-B, meteorología, NOTAM, Lido, autorouter, AFTN/AMHS ni un modelo de IA. La pestaña de integraciones puede existir en estado `Not configured`.

Sí entran: identidad y permisos, Crew manual, Aircraft, FPL Venezuela en PDF con presentación manual, Daily Log y offline con hora original, conversor, adjunto de peso y balance, Operations Services, mantenimiento básico, SMS, actas y biblioteca sin asistente.

No implementar en esta iteración el generador automático de roles, el cálculo de peso y balance, inventario avanzado, audio, video ni OCR que escriba solo.

## Código

NestJS y Fastify. TypeScript estricto. El dominio no nombra proveedores de mapas o seguimiento: eso vive detrás de un puerto, desconectado hasta la iteración 2.

Validar identificadores de base antes de interpolarlos. No devolver claves, hashes ni cadenas de conexión. Un guardado fallido no responde éxito. Una operación repetida no duplica gasto, firma ni horas.

Textos de API orientados al usuario salen del catálogo de idioma. Códigos oficiales (FPL, DLA, CHG, CNL, METAR, NOTAM, matrículas) no se traducen.
