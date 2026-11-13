# Aircraft — iteración 1

Alcance de Aircraft en la primera iteración. El corte sigue en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md). La ficha del módulo, en [03-modulos.md](03-modulos.md), remite aquí.

El prototipo muestra aeronaves y simuladores, equipos, componentes y un historial manual. En esta iteración entra la ficha de la aeronave. El simulador, el inventario de equipos y el cálculo de peso y balance quedan fuera.

## Qué entra

Cuatro pestañas: Resumen, Documentos, Discrepancias y Historial de vuelos.

El alta pide matrícula, modelo, serial y base. El modelo y la base se completan con valores ya usados y admiten uno nuevo. La ficha nace con estado técnico desconocido. Activar o guardar la ficha no declara aeronavegabilidad. Entrar a la vista no selecciona la primera aeronave. Al guardar se abre esa ficha.

Horas de célula y ciclos pueden quedar vacíos. Vacío significa desconocido y no se guarda como cero. Un cero escrito es un saldo declarado.

Documentos: título, estado (vigente, por vencer, vencido) y vencimiento. El archivo se adjunta aparte y no habilita la aeronave.

Discrepancias muestra el expediente de Maintenance de esa matrícula. El alta del hallazgo sigue en Maintenance.

Historial de vuelos abre los vuelos ya registrados de esa aeronave. El seguimiento en vivo no vive aquí.

## Qué no entra

Simuladores, foto de la aeronave, catálogo de modelos separado, equipos de emergencia, componentes, saldo histórico manual, trazabilidad de versiones y la liberación de mantenimiento.

## Rutas

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/aircraft` | Lista vivas |
| `GET` | `/aircraft/:id` | Ficha, documentos, discrepancias y vuelos |
| `POST` | `/aircraft` | Alta |
| `PUT` | `/aircraft/:id` | Edición parcial |
| `POST` | `/aircraft/:id/documents` | Alta de documento |
| `PUT` | `/aircraft/documents/:documentId` | Edición parcial |
| `DELETE` | `/aircraft/documents/:documentId` | Baja lógica |

Migración `010_aircraft_counters_nullable.sql`: horas y ciclos pueden ser nulos.
