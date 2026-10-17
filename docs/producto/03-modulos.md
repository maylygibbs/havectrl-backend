# Módulos

Detalle funcional para implementar. El corte por iteración está en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md).

## Home y Settings

Home es la entrada después del login. Muestra solo lo que esa persona puede abrir: próxima asignación, vuelos del día, flota, alertas y tareas. Cada tarjeta abre el registro de origen. Un módulo sin permiso no se delata con un contador.

La flota separa condición técnica y movimiento. Si no hay clasificación, el estado es `Unknown`. Si no hay vuelos porque la consulta terminó bien, el vacío lo dice. Cargando, sin permiso, sin red, datos parciales y fuente no disponible son estados distintos.

SMS en Home tiene dos puertas. Cualquier trabajador autorizado puede enviar un reporte. La bandeja, las cifras y la actividad reservada solo las ven los cargos habilitados. El resto ve documentos publicados y tareas ya desidentificadas.

Settings tiene preferencias personales para todos (idioma, fecha, unidades, avisos). El administrador configura compañía, usuarios, roles, equipos, delegaciones, reglas, plantillas, numeración, integraciones y auditoría. Una conexión se muestra `Not configured` hasta que una prueba real diga otra cosa. Las credenciales no salen en pantalla, PDF ni auditoría.

HAVECTRL registra pagos y comprobantes. No mueve el dinero.

## Crew

Tres pestañas: Data, Schedule y Experience.

Data cubre identidad, empleo, licencias, habilitaciones, instructor, médico, idiomas, pasaporte y visa, tallas y formación. Cada documento tiene revisión y vigencia por separado: aceptado puede estar vencido, y uno futuro no desplaza al vigente. El trabajador propone; el responsable acepta. Subir un archivo no habilita a la persona.

Schedule publica el rol de servicio. Las actividades son vuelo, trabajo, guardia, día libre, descanso, formación, ausencia e indisponible. Día libre, descanso y ausencia no son lo mismo. Cada jefe publica solo su equipo. El trabajador pide un cambio; el calendario no se mueve hasta que se aprueba y se publica.

El generador automático propone un borrador con cobertura, días libres y reparto. No publica solo. Usa reglas del operador. Si no hay regla, el resultado es `Not evaluated`, no un rol válido. Este generador es un motor interno, no una API de pago, y el resumen MVP lo deja fuera de la fase 1.

Experience sale del LOG confirmado de quien realmente voló o trabajó. El rol previsto no acredita horas. El simulador no suma vuelo real. El saldo inicial sin fechas no se reparte por meses inventados.

## Aircraft

Cuatro pestañas: Overview, Documents, Discrepancies & Corrective Actions y Flight History.

Overview guarda matrícula, serial, base, equipos instalados y la configuración de peso, rendimiento y cabina, cada una con fuente y validador. Activar la ficha no declara aeronavegabilidad.

Los contadores de célula, motor, hélice y equipo son independientes. Horas de vuelo, de calzos y de motor no se intercambian. El saldo inicial tiene corte, evidencia y revisor. Desconocido no se guarda como cero.

Documents es el archivo de esa aeronave, con revisión. Discrepancies es el mismo expediente que Maintenance. Flight History abre los tramos y el LOG reales. El seguimiento en vivo no vive aquí: pertenece a Flights y, además, solo a dos cargos.

## Flights

Siete pestañas, más el manifiesto dentro del plan de vuelo.

| Pestaña | Qué hace |
| --- | --- |
| Flight Planning | Ruta, puntos, estimados de tiempo y combustible. El mapa y la base de aerovías dependen de datos contratados. |
| Flight Plan | FPL, DLA, CHG, CNL y manifiesto. |
| Daily Log | Tiempos, ciclos, parámetros, reportes y firmas del día. |
| Weight & Balance | Carga del tramo. El cálculo usa la envolvente validada de esa matrícula. |
| Flight Tracking | Posición externa, con antigüedad y cobertura. |
| Weather & NOTAMs | Texto original de la fuente, con hora de consulta. |
| Unit Converter | Conversión de unidades. No es una carta ni un performance. |

Un vuelo tiene `flight_id`. Cada tramo tiene `leg_id`. El LOG diario agrupa una aeronave y una fecha operativa. Copiar un vuelo crea un borrador sin firmas, pasajeros ni pagos.

Estados que no se mezclan: operación (planificado, asignado, listo, salido, llegado, cancelado), documento (borrador, validado, firmado, sustituido), presentación ATS (no enviado, enviado, aceptado, rechazado o desconocido) y LOG (borrador, enviado, confirmado, corregido). Llegar la hora prevista no significa que despegó. Generar un PDF no significa que ATS aceptó el plan.

### Plan de vuelo Venezuela

La primera versión usa solo el perfil documental venezolano: FPL con membrete INAC/SNA, manifiesto anexo y formulario conjunto DLA/CNL/CHG. Las casillas institucionales no las personaliza el trabajador.

Prepara, valida, previsualiza y genera PDF. La presentación y la respuesta se registran a mano, con evidencia. No transmite a INAC, ARO/AIS/COM, AFTN ni AMHS. No implementa perfiles de otros países.

Cada registro es un tramo. El identificador ATS de la casilla 7 puede ser distinto de la matrícula. Aircraft y Crew aportan una copia al documento; un cambio posterior en la ficha no reescribe un PDF ya emitido.

### Daily Log

La bitácora es por aeronave y por día. Las bases iniciales nombradas en el manual son King Air 350 y Learjet 45: modelo y matrícula cargan plantilla, libro y número de hoja. Solo el administrador configura parámetros. El PDF puede llevar el logo de la compañía o el de HAVECTRL.

El piloto escribe horarios, ruta, tripulación, pasajeros, parámetros y reportes, y firma lo suyo. Mantenimiento revisa el mismo LOG, no una copia. Puede ajustar horas y ciclos de revisión con motivo e historial. Si el dato original está mal, pide corrección al autor. Firmar la revisión diaria no libera la aeronave y no vuelve a sumar contadores.

### Peso y balance, seguimiento y meteorología

El manual de Flights describe el cálculo con envolvente, brazos y consumo. El resumen MVP, que manda en el corte, pide en la fase 1 **adjuntar** el peso y balance hecho fuera, y deja el cálculo por aeronave como ampliación.

Flight Tracking y Weather & NOTAMs dependen de proveedores. Una consulta fallida no significa “no hay NOTAM”. El seguimiento no modifica el LOG. Solo el administrador y el jefe de pilotos abren Flight Tracking. El mapa no se inicializa al entrar a Flights: hace falta entrar a la pestaña y pulsar abrir el mapa en vivo.

Los gastos no se capturan en Flights. Si el volumen 04 todavía muestra Expenses, prevalece el resumen MVP: el gasto vive solo en Operations Services.

## Operations Services

Cinco pestañas: Flight Overview, Airport Fees, Operational Services, Payments, Documents & Expenses.

El ciclo es solicitado, cotizado, confirmado, recibido, facturado y pagado. Cada estado tiene evidencia. Un mismo documento no crea dos importes. Una obligación es el monto exigible. Pagarla no crea otro gasto.

Airport Fees guarda liquidaciones por aeropuerto y beneficiario, con la tarifa que aporte el operador. Operational Services cubre combustible, handling, catering, transporte y HOTAC. Payments abre el enlace oficial del ente cuando exista y guarda el comprobante. HAVECTRL no confirma un pago sin respaldo.

Documents & Expenses es el único lugar para crear gastos. El piloto firma el suyo. Otra persona lo revisa. Rechazado vuelve como versión nueva. No se suman monedas distintas.

## Maintenance

Siete pestañas, en este orden: Overview, Log Review, Inspections, Discrepancies & Corrective Actions, Work Orders, Components & Materials, History.

Log Review es la revisión diaria del LOG. Estados: pendiente, borrador de revisión, corrección pedida y revisado. Una discrepancia puede seguir abierta con el LOG ya revisado.

Inspections lleva el programa, el remanente y el próximo límite. El umbral de aviso no cambia el intervalo aprobado. Sin utilización suficiente, la proyección es `No estimate`.

La discrepancia conserva el relato del piloto. La evaluación, la acción, la prueba y la liberación son registros distintos. Diferir exige una referencia aplicable, por ejemplo MEL, no una nota libre.

Work Orders asigna técnicos, pasos, bloqueos y firmas de ejecución. Components & Materials cubre vida, instalación, remoción, existencias y pedido. El técnico puede pedir material. No aprueba la compra ni el pago: eso está en Operations Services.

El resumen MVP llama “mantenimiento básico” a inspecciones, discrepancias, acciones, evidencia y seguimiento, con la separación entre cierre administrativo y liberación. Inventario y órdenes avanzadas se cotizan aparte. El límite exacto está preguntado en [05-dudas.md](05-dudas.md).

## SMS

Siete pestañas: Overview, Safety Reports, Risk Register, Action Plans, Safety Documents, Assurance y Training.

El flujo es reporte, peligro y riesgo, medida, verificación de eficacia y cierre. El reporte puede ir con nombre o anónimo. El canal anónimo no debe guardar metadatos que identifiquen al autor.

La app apoya el manual SMS del operador, con marco de Anexo 19 y orientación del Doc 9859. No certifica cumplimiento. Antes de uso operacional hay que contrastar el texto aplicable y, si la operación es Venezuela, la regulación nacional. Eso no está cerrado en los documentos.

Quién lee el expediente original está en conflicto entre el resumen MVP y el manual de roles. Hasta resolverlo, no se amplía esa lectura. Ver [05-dudas.md](05-dudas.md).

Una instrucción interna se desidentifica, se revisa, se aprueba, se versiona y se marca como leída. Maintenance no recibe el expediente reservado: solo un extracto autorizado. Buscador, exportación, correo y Home obedecen la misma reserva.

## Communication

Tres pestañas: Calls, Meetings y Meeting Minutes.

Una conversación no cambia un rol, no acredita horas y no libera una aeronave. Nadie lee el hilo privado de otro. Nadie enciende la cámara o el micrófono de otro.

La fase 1, según el resumen MVP, es reunión con agenda y convocatoria manual, y acta escrita o cargada, con revisión, firma de cada quien y versiones.

Audio, video, transcripción y borrador de minuta con IA quedan para cuando haya proveedor y presupuesto. El chat persistente, compartir pantalla y el archivo permanente de audio o video ni siquiera están en el mínimo del volumen.

## Aviation Library

Pestañas: Documents, Reader, Revisions, Bookmarks, Administration y AI Assistant.

El catálogo guarda título, código, editor, categoría, edición, enmienda, idioma, vigencia, estado y acceso. Current, sustituido, borrador, pendiente y retirado no se mezclan. La fecha de carga no es la vigencia.

El lector muestra el original con página. Administration publica revisiones. No todo el que lee puede sustituir un manual aprobado. HAVECTRL no incluye sola la suscripción OACI ni actualiza documentos sin una fuente autorizada.

AI Assistant responde con documento, edición y página. Si no hay respaldo, lo dice y no inventa. Queda fuera de la fase 1. Los asistentes de Flights, Maintenance, Aircraft, Operations y Crew que aparecen en la presentación son una visión posterior, con la misma regla de cita y abstención.
