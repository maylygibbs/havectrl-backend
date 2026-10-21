# Fuentes revisadas

Lectura hecha el 17 de octubre de 2026 sobre `/home/mgibbs/Downloads/HAVECTRL/HAVECTRL`.

Este paquete es la especificación de producto. No sustituye los manuales del operador ni certifica cumplimiento OACI, INAC o de ningún explotador.

## Documentos de producto

| Documento | Fecha | Qué aporta |
| --- | --- | --- |
| `Hub_Control_MVP_Programador.pdf` v3.1 | 14 oct 2026 | Fases, hitos y qué queda fuera de las APIs de pago. Manda sobre el corte del MVP. |
| `HAVECTRL_Presentacion_del_Producto.pdf` v1.2 | 14 oct 2026 | Visión, usuarios y caso de uso. No sustituye los manuales. |
| `HAVECTRL_V01_Introduccion_Home_Settings.pdf` v2.2 | 14 oct 2026 | Acceso, permisos, Home, Settings, firmas, idioma y pruebas ACC. |
| `HAVECTRL_V02_Crew.pdf` v1.1 | 9 oct 2026 | Data, Schedule y Experience. Incluye rol manual y generador automático. |
| `HAVECTRL_V03_Aircraft.pdf` v1.0 | 9 oct 2026 | Ficha, contadores, documentos, discrepancias e historial. |
| `HAVECTRL_V04_Flights.pdf` v1.0 | 9 oct 2026 | Siete pestañas de Flights. En gastos, pierde frente al resumen MVP. |
| `HAVECTRL_Flights_Flight_Plan_Venezuela_Manual_Programador_V1_0.pdf` | 15 oct 2026 | FPL, manifiesto y DLA/CHG/CNL del perfil Venezuela. Sin transmisión ATS. |
| `HAVECTRL_Flights_Log_Manual_Final_V1_1.pdf` | 15 oct 2026 | Daily Log, plantillas por aeronave y revisión de mantenimiento. |
| `HAVECTRL_V05_Operations_Services.pdf` v1.0 | 9 oct 2026 | Tasas, servicios, pagos y gastos. Único lugar de los gastos. |
| `HAVECTRL_V06_Maintenance.pdf` | posterior al 9 oct | Siete pestañas, incluido Log Review. |
| `HAVECTRL_V07_SMS.pdf` v2.0 (el archivo duplicado es idéntico) | 14 oct 2026 | Siete pestañas SMS. El encabezado interno dice volumen 09. |
| `HAVECTRL_V07_Communication.pdf` v1.2 | 9 oct 2026 | Calls, Meetings y Meeting Minutes. |
| `HAVECTRL_V08_Aviation_Library.pdf` v1.0 | 9 oct 2026 | Catálogo, lector, revisiones, marcadores, administración e IA. |
| `HAVECTRL_Manual_Roles_y_Permisos_V1_4.pdf` | 15 oct 2026 | Matriz de diez perfiles y restricción de Flight Tracking. |
| `HAVECTRL_Anexo_Visual.pdf` v1.0 | 8 oct 2026 | Láminas de interfaz. Las cifras son demostración. |

## Normas citadas, no módulos

| Documento | Uso |
| --- | --- |
| `Plan de vuelo-DOC4444-OACI-ANEXO-2-PLAN-DE-VUELO.pdf` | Formulario modelo OACI, instrucciones de llenado y mensajes FPL/SPL/RPL. |
| `Anexo-2.pdf`, `Anexo-9.pdf`, `OACI-DOC-4444.pdf`, `153307616-OACI-4444.pdf` | Texto normativo de referencia. El producto no los implementa como módulo ni los redistribuye. |
| Cuatro PNG del mismo directorio | Imágenes sueltas de apoyo visual. No añaden reglas que no estén en los manuales. |

## Qué documento manda si chocan

1. La instrucción vigente del resumen MVP (14 oct 2026) define el corte de fase.
2. El manual del módulo define campos y pantallas de lo que esa fase incluye.
3. Roles v1.4 (15 oct 2026) y los manuales de FPL Venezuela y LOG (15 oct 2026) son más nuevos que los volúmenes compactos del 9 oct en permisos, plan de vuelo y bitácora.
4. Una pantalla de demostración no cuenta como función terminada.

Los choques que no se pueden cerrar con esa regla están en [05-dudas.md](05-dudas.md).

El avance de implementación de la iteración 1 (soft delete, Crew CRUD, idioma) está en [07-iteracion1-avance.md](07-iteracion1-avance.md).
