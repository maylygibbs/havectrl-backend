# Maintenance — iteración 1

Alcance de Maintenance en la primera iteración. El corte sigue en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md). La ficha del módulo, en [03-modulos.md](03-modulos.md), remite aquí. La duda 3 de [05-dudas.md](05-dudas.md) sigue abierta: este corte usa la opción estrecha y no la cierra.

La lectura sigue este orden. El volumen 06 del origen (15 oct 2026) describe siete pestañas, con Log Review, inventario y órdenes con secuencia. Control de cambio 1 tiene la carpeta Maintenance del 6 de noviembre. El prototipo separa el mantenimiento del operador y el del simulador, y deja Log Review fuera de la pestaña general del operador. Components & Materials no entra.

## Qué entra

Cinco vistas: Resumen, Inspecciones, Discrepancias, Órdenes y Revisión de LOG.

El resumen cuenta. Entrar a la vista no abre el primer registro.

Registrar inspección pide la aeronave ya existente y un título. La fecha y el límite de horas pueden quedar vacíos. Vacío es desconocido. Cero es un límite declarado.

Registrar discrepancia guarda el reporte original, aparte de la acción correctiva. El autor es la sesión. El mismo registro aparece en la ficha de la aeronave.

Registrar orden pide aeronave, responsable y título. Puede apuntar a una discrepancia de esa aeronave. Terminarla exige evidencia. Terminarla no libera la aeronave ni cambia su estado técnico.

Revisión de LOG muestra la misma bitácora de Flights. Revisarla aquí no libera la aeronave ni vuelve a sumar horas.

## Qué no entra

Componentes, existencias, precios, secuencia larga de la orden, diferimiento con referencia MEL, firma de liberación y el ajuste de horas de revisión. El prototipo de simuladores tampoco entra.

## Rutas

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/maintenance/inspections` | Inspecciones vivas |
| `POST` | `/maintenance/inspections` | Alta |
| `GET` | `/maintenance/discrepancies` | Discrepancias vivas |
| `POST` | `/maintenance/discrepancies` | Alta, con el autor de la sesión |
| `GET` | `/maintenance/work-orders` | Órdenes vivas |
| `POST` | `/maintenance/work-orders` | Alta. El estado terminada exige evidencia |
| `GET` | `/maintenance/log-review` | La bitácora ya registrada |

Migración `012_maintenance_evidence.sql`.
