# Aviation Library — iteración 1

Alcance de Aviation Library en la primera iteración. El corte sigue en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md). La ficha del módulo, en [03-modulos.md](03-modulos.md), remite aquí.

La lectura sigue este orden. El volumen 08 del origen describe catálogo, lector, revisiones, marcadores, administración y un asistente. El resumen MVP deja el asistente fuera. Control de cambio 1 tiene la carpeta Library del 6 de noviembre. El prototipo muestra el asistente apagado y compara dos PDF. Esta entrega no compara páginas ni consulta un modelo.

## Qué entra

Cuatro pestañas: Documentos, Lector, Revisiones y Marcadores.

Registrar documento abre el formulario vacío: código, título, categoría, edición, enmienda, idioma y referencia de familia. Las ediciones del mismo manual comparten la referencia y cada una es un registro nuevo. El PDF original se adjunta al registro. Entrar a la vista no abre el primer documento.

Quien lee registra un borrador. Un administrador lo publica como vigente, sustituido o retirado. El catálogo de lectura muestra vigente y sustituido. El borrador y el retirado quedan en la administración.

El lector pide elegir el documento. Si hay PDF, abre el original. Si no hay archivo, lo dice. Una edición sustituida avisa que hay que revisar la vigente.

Un marcador guarda página y nota de quien inició sesión, sobre una edición vigente o sustituida. No se ve el marcador de otra persona.

## Qué no entra

El asistente, la comparación automática de dos ediciones, el OCR y la búsqueda dentro del texto del PDF.

## Rutas

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/library/documents` | Catálogo visible para ese perfil |
| `POST` | `/library/documents` | Alta. Publicar exige administrador |
| `GET` | `/library/bookmarks` | Marcadores de la sesión |
| `POST` | `/library/bookmarks` | Alta de marcador propio |
| `POST` | `/files` | PDF con `module=library` y el id del documento |
| `GET` | `/files` | Archivos de ese documento |

Migración `014_library_editions.sql`.
