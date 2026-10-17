# APIs externas e iteraciones

Fuente de corte: `Hub_Control_MVP_Programador.pdf` v3.1, 14 oct 2026.

**Iteración 1** es la fase 1 completa: el MVP que opera sin contratar mapas, seguimiento, meteorología ni datos de rutas. Por dentro se construye en tres hitos, 1A, 1B y 1C, porque el propio documento los usa como aceptación.

**El resto** es la fase 2 (compras e integraciones) y las ampliaciones que el resumen aparta de esa compra.

Infraestructura de la iteración 1, cotizada aparte del desarrollo y aparte de las APIs: despliegue, almacenamiento de archivos y respaldo. Postgres y el almacén de objetos no son una API aeronáutica.

## Módulos que no necesitan una API externa

Estos módulos se cierran con la base de la compañía, archivos y las reglas del operador.

| Módulo | Por qué no depende de un proveedor aeronáutico |
| --- | --- |
| Home | Resume registros internos. Si una fuente externa falta, la tarjeta dice fuente no disponible y el resto abre igual. |
| Settings | Usuarios, roles, idioma, compañía, plantillas y auditoría. La pestaña Integrations existe para mostrar `Not configured`. |
| Crew | Fichas, documentos, rol manual y experiencia derivada del LOG. |
| Aircraft | Ficha, contadores, documentos, discrepancias e historial de vuelos ya registrados. |
| Operations Services | Solicitudes, tasas, gastos, comprobantes y pagos registrados a mano. El enlace de pago del ente es una URL, no una pasarela integrada. |
| Maintenance, alcance básico | Inspecciones, discrepancias, acciones, evidencia, Log Review y liberación separada del cierre administrativo. |
| SMS | Las siete pestañas, con reserva del expediente. No reporta solo a una autoridad. |
| Communication, sin llamada | Agenda, convocatoria, acta manual o cargada, revisión, firmas y versiones. |
| Aviation Library, sin IA | Catálogo, lector, versiones, marcadores y administración de los PDF que el operador suba. |
| Flights, parte interna | Alta del vuelo y tramos, FPL Venezuela en PDF, DLA/CHG/CNL, manifiesto, Daily Log, eventos offline, conversor y adjunto de peso y balance. |

El generador de roles y el cálculo de peso y balance tampoco llaman a una API de pago. Aun así no entran en la iteración 1: el resumen los deja como ampliación.

## Qué sí necesita un proveedor

| Capacidad | Dónde | Candidato nombrado | Iteración |
| --- | --- | --- | --- |
| Mapa interactivo e imagen satelital | Flights > Flight Planning y Flight Tracking | Mapbox | 2 |
| Posición, trayectoria, altitud y velocidad | Flights > Flight Tracking | ADS-B Exchange | 2 |
| Meteorología aeronáutica | Flights > Weather & NOTAMs | The Weather Company | 2 |
| NOTAM | Flights > Weather & NOTAMs | Hay que contratar un servicio propio. No se asume incluido en el clima. | 2 |
| Aeropuertos, pistas, fijos, aerovías, ciclo AIRAC | Flights > Flight Planning | Lufthansa Systems / Lido | 2 |
| Motor de rutas, si se justifica | Flight Planning | autorouter, solo tras prueba LATAM y licencia. No se contrata en paralelo sin motivo. | 2 |
| Audio y video | Communication > Calls y Meetings | Proveedor todavía no elegido | Resta |
| Transcripción y minuta asistida | Communication > Meeting Minutes | Proveedor de IA | Resta |
| Consulta con cita de página | Aviation Library > AI Assistant, y los asistentes de la presentación | Proveedor de IA, con permiso y fuente | Resta |
| Transmisión del plan a ATS | Flights > Flight Plan | AFTN/AMHS u otro canal. La spec Venezuela lo excluye también de su primera versión. | Fuera del alcance actual |

Condiciones antes de comprar: cotización, licencia, cobertura Venezuela y LATAM, límites, retención, redistribución, soporte y costo recurrente. Mapbox no da posiciones ADS-B. Lido no incluye un motor de rutas. La caída de una API no bloquea el MVP.

## Iteración 1, el MVP

### 1A. Base

Compañías aisladas. Usuarios, roles y permisos de la matriz, con la duda SMS sin ampliar lectura. Crew en Data, Schedule manual y Experience. Aircraft en ficha, documentos y saldos. Archivos y respaldo.

### 1B. Operación

Vuelos y tramos. FPL Venezuela, manifiesto y DLA/CHG/CNL como documentos, con presentación manual. Daily Log, sincronización offline y contadores que no se duplican. PDF de LOG y de plan. Operations Services completo en registro manual. Mantenimiento básico y Log Review.

### 1C. Cierre del MVP

SMS funcional y reservado. Actas y biblioteca documental sin asistente. Pruebas con cuentas de cada perfil, correcciones y guía de administración.

Entrega de la iteración: código, despliegue, migraciones, permisos documentados, pruebas críticas, respaldo y restauración. Una pantalla de demostración no cierra el hito.

Criterios que bloquean la entrega:

- Una compañía no lee a otra.
- El expediente SMS no se filtra por búsqueda, exportación ni Home.
- El evento offline conserva su hora.
- LOG y contadores no se duplican al reintentar.
- Corregir un confirmado deja historial.
- La firma y la facultad técnica se validan en el servidor.
- El seguimiento, cuando exista, no toca el LOG.

## Resto de iteraciones

### Iteración 2. Integraciones

2A. Cotizaciones aprobadas, cobertura comprobada y credenciales guardadas fuera del código.

2B. Primero mapas y Flight Tracking, solo para administrador y jefe de pilotos, con el mapa bajo demanda. Después clima, NOTAM y planificación sobre datos aeronáuticos, según el contrato.

2C. Pruebas con datos reales, antigüedad y cobertura visibles, fallo del proveedor controlado y consumo medido.

### Iteraciones siguientes. Ampliaciones

No son compras de mapa ni de ADS-B. Se cotizan solas:

- Rol automático de Crew, con explicación y publicación humana.
- Peso y balance calculado con la envolvente de cada matrícula. En la iteración 1 solo se adjunta el documento externo.
- Inventario, abastecimiento y órdenes de trabajo con secuencia avanzada.
- Llamadas y reuniones con audio y video.
- Transcripción y borrador de acta con IA, siempre revisado antes de firmar.
- AI Assistant de la biblioteca y los asistentes de Flights, Maintenance, Aircraft, Operations y Crew descritos en la presentación.
- OCR que solo propone campos.
- Transmisión del FPL a un canal ATS.
- Perfiles documentales de plan de vuelo que no sean Venezuela.

## Pruebas que la iteración 1 ya debe poder correr

Separación de compañías, ámbito de Crew, reserva SMS, un solo LOG visto desde Flights y Maintenance, contadores sin doble suma, revisión administrativa distinta de liberación, gastos sin aprobación propia, lectura que no edita, y revocación de sesión. Los identificadores están en el volumen 01 (ACC-01 a ACC-20), en roles (RP01 a RP10) y en cada manual de módulo. RP11 a RP14, de Flight Tracking, se ejecutan cuando esa pestaña exista: en la iteración 1 el resultado esperado es que nadie pueda abrirla.
