# Idea de producto

HAVECTRL es la plataforma de operación de una compañía aérea. Reúne personas, aeronaves, vuelos, servicios, mantenimiento, seguridad operacional y documentación en un solo sistema, con responsable, versión y firma.

La frase de interfaz, en inglés inicial, es **YOU HAVE CONTROL.** / *Everything your operation needs, in one place.* En español: **TÚ TIENES EL CONTROL.** / *Todo lo que necesita tu operación, en un solo lugar.*

## Para quién es

Una instalación atiende a **una compañía**. Dentro de ella trabajan administración, jefes de operaciones, SMS, mantenimiento y cabina, pilotos, técnicos, despacho, tripulantes y personal de línea. Cada persona ve lo que su cargo y su ámbito permiten. El administrador de una compañía no administra a las demás.

El caso de uso que conecta los módulos es este:

1. Crew y Aircraft dejan listos al personal y a la aeronave.
2. Flights y Aviation Library preparan la ruta y las referencias.
3. Operations Services confirma servicios y guarda los gastos.
4. Flights registra el LOG real.
5. Maintenance evalúa, trabaja y, si corresponde, libera.
6. SMS y Communication conservan riesgos, medidas y actas sin publicar el expediente reservado.

## Qué distingue un registro de otro

| Capa | Qué es | Qué no es |
| --- | --- | --- |
| Previsto | Rol de servicio, ruta planificada, hora estimada | Horas reales de la aeronave |
| Presentado | FPL, DLA, CHG o CNL emitido, con evidencia de envío | Aceptación ATS |
| Observado | Posición o meteorología de un proveedor | Bitácora ni contadores |
| Confirmado | LOG firmado, revisión, pago con comprobante, liberación técnica | Un borrador o un PDF generado |

Un vacío no es cero. Falta de datos produce `Not evaluated`, `Unknown` o `Not available`, nunca un cumplimiento inventado.

## Orden de módulos

Home, Crew, Aircraft, Flights, Operations Services, Maintenance, SMS, Communication, Aviation Library. Settings queda aparte, al pie. No existe un módulo Reports: cada exportación sale de su módulo.

## Identidad visual

Logo HAVECTRL fijo en la aplicación. Paleta negra, blanca y plateada, con acento azul cielo. El color nunca es la única señal de un estado. El logo del operador aparece solo en documentos exportados.

La marca por tenant ya esbozada en el código (color distinto por cliente) choca con esta regla. Ver [05-dudas.md](05-dudas.md).

## Idioma

Inglés es el idioma inicial de la interfaz. Cada usuario puede pasar a español antes y después del login. La preferencia vive en la cuenta.

Se traducen menús, botones, validaciones y estados. No se traducen matrículas, códigos OACI/IATA, FPL, DLA, CHG, CNL, METAR, TAF, NOTAM, texto ya firmado ni el formulario oficial. El idioma de la pantalla, el de la plantilla y el de la fuente son independientes.

## Lo que el producto no declara

No certifica SMS, no aprueba un vuelo, no libera una aeronave y no es intermediario de pagos. Una minuta, una llamada o una respuesta de IA no autorizan una salida ni un retorno a servicio.
