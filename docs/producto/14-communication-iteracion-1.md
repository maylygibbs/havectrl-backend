# Communication — iteración 1

Alcance de Communication en la primera iteración. El corte sigue en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md). La ficha del módulo, en [03-modulos.md](03-modulos.md), remite aquí.

La lectura sigue este orden. El volumen 07 del origen describe Calls, Meetings y Meeting Minutes. El resumen MVP deja la fase 1 en la reunión: agenda, convocatoria manual y acta escrita o cargada. Audio, video y la minuta asistida esperan un proveedor. Control de cambio 1 tiene la carpeta Comunication del 6 de noviembre. El prototipo conserva las tres pestañas y, en la reunión, un enlace de Teams, Zoom o Meet. Ese enlace no abre una llamada dentro de HAVECTRL.

## Qué entra

Dos pestañas: Reuniones y Acta. Calls no se muestra.

Convocar reunión abre el formulario vacío: título, fecha y hora, y agenda. El estado puede quedar en borrador, convocada o cancelada. El enlace es opcional y tiene que empezar por `http://` o `https://`. Entrar a la vista no abre la primera reunión.

Redactar acta elige la reunión y escribe el texto. Registrarla exige texto. Una reunión no cambia un rol, no acredita horas y no libera una aeronave.

## Qué no entra

Llamadas, audio, video, transcripción, borrador de acta con IA, firmas de cada asistente y el historial de versiones del acta. El archivo cargado del acta también queda para el cierre siguiente: esta entrega guarda el texto.

## Rutas

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/communication/meetings` | Reuniones vivas |
| `POST` | `/communication/meetings` | Convocatoria |
| `PUT` | `/communication/meetings/:id/minutes` | Acta escrita. Registrada exige texto |

Migración `013_meeting_minutes.sql`.
