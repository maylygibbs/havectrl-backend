# Flights — iteración 1

Alcance de Flights en la primera iteración. El corte sigue en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md). La ficha del módulo, en [03-modulos.md](03-modulos.md), remite aquí.

La lectura de esta iteración sigue este orden: carpeta origen del 17 de octubre (`/home/mgibbs/Downloads/HAVECTRL/HAVECTRL`), Control de cambio 1 (Drive, carpeta Flights del 6 de noviembre) y el prototipo. Si un manual posterior choca con el resumen MVP, manda [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md).

## Qué dice cada fuente

| Fuente | Lectura de Flights |
| --- | --- |
| Origen, 17 oct | `HAVECTRL_V04_Flights.pdf` describe siete pestañas: Flight Planning, Flight Plan, Daily Log, Weight & Balance, Flight Tracking, Weather & NOTAMs y Unit Converter. El manual de FPL Venezuela (15 oct) pide FPL, manifiesto y DLA/CHG/CNL en PDF, con presentación manual y sin transmisión ATS. El manual de LOG (15 oct) pide bitácora por aeronave y día, plantillas King Air 350 y Learjet 45, parámetros solo del administrador, firmas y una hoja activa por matrícula y fecha. El resumen MVP deja el cálculo de peso y balance fuera y pide adjuntar el documento externo. Tracking, clima, NOTAM y el mapa son fase 2. Los gastos no se capturan aquí. |
| Control de cambio 1 | La carpeta Flights existe. El manual consolidado que recoge ese cambio es Flights V2.0 del 27 oct, conservado en el prototipo. Fija cuatro pestañas de fase 1: Flight Plan, Daily Log, Weight & Balance y Unit Converter. Flight Planning de cálculo de rutas no es una pestaña. Tracking, Weather & NOTAMs, transmisión ATS, correo integrado y firma certificada quedan en fase 2 y no se muestran como pestañas ni como conexión simulada. El LOG confirmado es la única fuente de utilización para Crew, Aircraft y Maintenance. |
| Prototipo | Cuatro pestañas, el mismo orden. Plan, bitácora y peso y balance se guardan como expediente de la aeronave. El conversor es local. Confirmar el LOG actualiza horas. La segunda fase se nombra al pie y no abre mapa ni clima. El propietario, el 28 oct, dejó vigente Flights V2.0 y pidió no reponer Flight Planning como módulo. |

## Qué entra

Cuatro pestañas: Flight Plan, Daily Log, Weight & Balance y Unit Converter.

Flight Plan abre el alta del vuelo: código, aeronave ya registrada, fecha, origen, destino y EOBT. Entrar a la vista no fabrica un plan. El botón dice la misma tarea que el título, Nuevo vuelo.

Daily Log abre el mismo vuelo para tramos y el registro ya existente. Confirmar ese registro no libera la aeronave.

Weight & Balance, en este corte, conserva el documento externo del vuelo. El cálculo de la envolvente queda fuera: el resumen MVP lo aparta y [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md) manda en ese choque. Flights V2.0 y el prototipo sí traen una calculadora preliminar. Esa diferencia queda abierta; no se cierra aquí.

Unit Converter convierte en el navegador longitud, velocidad, masa, volumen, temperatura, presión y tiempo. 1 NM = 1.852 km, 1 kt = 1.852 km/h, 01:30 = 1.5 h, 0 °C = 32 °F, 1 US gal = 3.785411784 L y 1 Imperial gal = 4.54609 L. Copiar incluye la unidad. Volumen y masa no se cruzan con una densidad precargada. Mach, IAS y TAS no entran. Aplicar el resultado a un campo del LOG espera a que la bitácora tenga esos campos.

## Qué no entra

Mapa, Flight Tracking, meteorología, NOTAM, motor de rutas, transmisión a ATS, gastos dentro de Flights, asistente, OCR y el cálculo de peso y balance. Una consulta que no existe no se presenta como “sin NOTAM”.

## Qué sigue pendiente dentro de este corte

El alta y los tramos ya existen. Falta el formulario venezolano del FPL, el PDF, DLA/CHG/CNL, el manifiesto, la bitácora por aeronave y día con plantilla y folio, la confirmación que suma una sola vez, el evento offline y el adjunto de peso y balance sobre el vuelo.

## Rutas ya disponibles

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/flights` | Lista |
| `POST` | `/flights` | Alta |
| `GET` | `/flights/:id` | Detalle |
| `PUT` | `/flights/:id` | Edición |
| `PUT` | `/flights/:id/log` | Bitácora del vuelo |
| `POST` | `/flights/:id/legs` | Alta de tramo |
| `PUT` | `/flights/legs/:legId` | Edición de tramo |
| `DELETE` | `/flights/legs/:legId` | Baja lógica del tramo |
