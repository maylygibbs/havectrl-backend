# Dudas abiertas

No bloquean el documento de alcance. Sí bloquean implementar el punto afectado. Hasta responder, se aplica la opción más estrecha.

## 1. Quién lee el expediente SMS

El resumen MVP, la presentación y el volumen 01 dicen que el original lo consultan tres cargos: administrador principal, jefe de operaciones y jefe de SMS.

El manual de roles v1.4, posterior, dice que la gestión completa es del administrador y del jefe de SMS. En su matriz de diez perfiles no existe “jefe de operaciones”. El jefe de pilotos solo puede reportar.

Hasta que se elija una lista, la lectura del original queda en administrador y jefe de SMS.

## 2. Marca de la aplicación y marca del cliente

Los manuales fijan logo HAVECTRL y paleta negra, blanca, plateada y azul cielo. El logo del operador entra solo en los PDF.

La arquitectura ya creada guarda colores distintos por tenant.

**Decisión en vigor (opción B):** cada cliente pinta la aplicación con sus colores de `branding` (`primary_color`, `accent_color`). El logo HAVECTRL permanece en la app. El logo del operador entra en PDF exportados cuando existan.

## 3. Qué entra en “mantenimiento básico”

El volumen 06 describe siete pestañas, inventario incluido. El resumen MVP incluye inspecciones, discrepancias, acciones, evidencia y seguimiento, y aparta inventario y órdenes avanzadas.

Propuesta, a la espera de confirmación: en la iteración 1 entran Overview, Log Review, Inspections, Discrepancies y un Work Order simple con evidencia y firmas. Components & Materials, existencias, precios y secuencias largas de procedimiento quedan después.

## 4. Plantillas iniciales del LOG

El manual del LOG nombra King Air 350 y Learjet 45 como bases iniciales. ¿Son las dos únicas plantillas del MVP o solo el ejemplo del formato?

## 5. Perfiles que el volumen 01 llama “propuesta”

Jefe de operaciones, supervisor de línea, revisor financiero y control documental no están en la matriz de diez perfiles. ¿El MVP implementa solo esos diez, y el resto se crea como cargo configurable sin pantallas nuevas?

## 6. Aviso por correo

Home y Settings hablan de correo y de no meter documentos personales en el aviso. No hay un proveedor elegido. ¿La iteración 1 se queda en la bandeja interna?

## 7. Corte de la iteración 1

Este documento toma la fase 1 entera (hitos 1A, 1B y 1C) como la iteración 1. Si la iteración 1 debe ser solo la base 1A, el resto de la fase 1 pasa a iteraciones intermedias. Hace falta confirmar ese corte antes de estimar.
