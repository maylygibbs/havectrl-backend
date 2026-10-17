# Reglas transversales

Aplican a todos los módulos. El servidor las hace cumplir. Ocultar un botón no basta.

## Un solo registro

Trabajador, compañía, aeronave, motor, tramo, documento, discrepancia, gasto y orden tienen un identificador estable. Aircraft, Flights y Maintenance muestran el mismo expediente. Flights no tiene una copia del gasto: abre el `expense_id` de Operations Services.

El trabajador existe aunque todavía no tenga cuenta. Activar el acceso después no duplica la ficha.

## Compañía

Toda consulta, archivo, búsqueda, exportación, notificación e IA queda dentro de la compañía del request. Cambiar un identificador en el cliente no abre datos de otra.

## Permiso

Cada permiso junta módulo, recurso, acción y ámbito.

Acciones separadas: ver, crear, editar borrador, subir, enviar, aprobar, confirmar LOG, firmar, liberar técnicamente, exportar, publicar programación y administrar.

Ámbitos: uno mismo, vuelos asignados, trabajo asignado, equipo, base, flota o compañía. La compañía siempre limita.

El cargo laboral no concede permisos. Un cargo nuevo nace sin acceso. Duplicar un rol no hereda Flight Tracking ni la lectura del expediente SMS. Nadie se concede permisos a sí mismo.

Ver el calendario del equipo no abre pasaportes, visas, expediente médico, tallas ni documentos personales de otros.

## Firmas

La firma es de una cuenta, una persona y una función. No se firma por otro. Una imagen de firma no es, por sí sola, un certificado.

Borrador se edita. Enviado se restringe. Firmado se protege. Corregir crea una versión nueva con motivo y conserva la anterior. El administrador puede abrir la corrección y no puede trasladar la firma ajena al texto nuevo.

Quien solicita un gasto no aprueba su propio reembolso. Cerrar una tarea, cerrar una discrepancia y liberar la aeronave son tres acciones distintas. La liberación exige habilitación vigente y alcance, no el cargo de jefe.

## Tiempo, horas y contadores

Se guarda fecha completa, zona de origen y UTC. La duración se guarda en segundos o minutos enteros: 1:30 es 1,50 h. Cada magnitud tiene unidad. Convertir para mostrar no cambia el valor guardado.

El LOG confirmado suma horas, ciclos y experiencia **una sola vez** por tramo. Un reintento no duplica. Una corrección aplica solo la diferencia. La planificación y el seguimiento externo no incrementan horas reales.

## Disponibilidad de la aeronave

La disponibilidad técnica (en servicio, en mantenimiento, no disponible) y la ubicación (en tierra, en vuelo) son ejes distintos. Una aeronave puede estar en tierra y en servicio a la vez. Home no levanta una restricción.

## Offline

Los eventos capturados sin red conservan la hora original. Al sincronizar se vuelven a validar permisos y versión. Dos editores del mismo borrador no se pisan en silencio.

## Alertas

Reconocer una alerta confirma lectura. No alarga una vigencia ni cierra la causa. Leerla no la borra.

## Archivos

Subir, previsualizar, descargar, imprimir, enviar y compartir son permisos distintos. El original se conserva. Un enlace no amplía el permiso de quien lo recibe.

## Auditoría

Cada cambio sensible guarda autor, rol efectivo, compañía, acción, recurso, versión, fecha UTC, motivo y valores anterior y nuevo. Desactivar un usuario revoca sesiones y no borra el historial.
