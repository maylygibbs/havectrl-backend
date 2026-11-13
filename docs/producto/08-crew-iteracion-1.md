# Crew — iteración 1

Alcance de Crew en la primera iteración. El corte de la fase sigue en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md). La ficha del módulo, en [03-modulos.md](03-modulos.md), remite aquí.

Fuente: `HAVECTRL_V02_Crew.pdf` v1.1 y la lámina 02 de `HAVECTRL_Anexo_Visual.pdf`. Si el volumen y el resumen MVP chocan, manda [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md).

## Qué entra

Tres pestañas: Data, Schedule y Experience. El prototipo enseña el caso de uso. El calendario de Schedule que ya está en el frontend se mantiene: es más compacto que el del prototipo y no se reemplaza.

Data. El alta es identidad y empleo: nombre, código, cargo, base, equipo (operaciones, mantenimiento o cabina) y correo. El correo puede ir vacío. La persona nace activa. Cargo y base se eligen de los valores ya usados y admiten uno nuevo. Licencia, médico y el resto de documentos viven en la ficha, no en el alta. Entrar a Datos no selecciona a la primera persona. Al guardar el alta se abre esa ficha.

La ficha pone primero los documentos (licencia, instructor, médico, idioma, viaje, talla, formación y otros) y después la información personal y el empleo. Cada documento tiene revisión y vigencia por separado: aceptado puede estar vencido, y uno futuro no desplaza al vigente. El trabajador propone; el responsable acepta. Subir un archivo no habilita a la persona. Los archivos van con `POST /files` (`module=crew`, `entityId` del trabajador).

Schedule publica el rol de servicio a mano sobre el calendario compacto: día, semana y mes, filtros por actividad y estado, alta en blanco o sobre un día vacío, edición al pulsar la celda y arrastre que solo cambia el día. Las actividades son vuelo, trabajo, guardia, día libre, descanso, formación, ausencia e indisponible. Día libre, descanso y ausencia no son lo mismo. Cada jefe publica solo su equipo. El trabajador pide un cambio; el calendario no se mueve hasta que se aprueba y se publica.

Experience muestra horas (un decimal) del LOG confirmado. El simulador no suma vuelo real. El saldo inicial sin fecha no se reparte por meses. El rol previsto no acredita horas.

Experience sale del LOG confirmado de quien realmente voló o trabajó. El rol previsto no acredita horas. El simulador no suma vuelo real. El saldo inicial sin fechas no se reparte por meses inventados.

La pantalla es un directorio a la izquierda y la ficha a la derecha. El hero es `havectrl-frontend/public/heroes/hero-crew.png`.

Borrar un trabajador es baja lógica: `deleted_at`, `status = inactive`, y en cascada sus asignaciones, experiencia y documentos. El registro permanece.

## Qué no entra

El generador automático propone un borrador con cobertura, días libres y reparto. No publica solo. Usa reglas del operador. Si no hay regla, el resultado es `Not evaluated`, no un rol válido. Es un motor interno, no una API de pago, y el resumen MVP lo deja fuera de la fase 1.

Tampoco entran el OCR que solo propone campos, el asistente de Crew, el calendario ancho del prototipo, los retratos de demo ni el catálogo regulatorio de todos los países.

## Rutas

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/crew` | Lista vivos |
| `GET` | `/crew/:id` | Detalle, asignaciones, experiencia, documentos y adjuntos |
| `POST` | `/crew` | Alta |
| `PUT` | `/crew/:id` | Edición parcial |
| `DELETE` | `/crew/:id` | Baja lógica |
| `POST` | `/crew/:id/documents` | Alta de documento |
| `PUT` | `/crew/documents/:documentId` | Edición parcial |
| `DELETE` | `/crew/documents/:documentId` | Baja lógica |
| `GET` / `POST` / `DELETE` | `/crew/assignments` y `/crew/:id/assignments` | Rol manual |

Tabla `crew.worker_documents`, migración `007_crew_worker_documents.sql`.
