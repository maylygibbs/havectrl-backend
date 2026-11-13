# Operations Services — iteración 1

Alcance de Operations Services en la primera iteración. El corte sigue en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md). La ficha del módulo, en [03-modulos.md](03-modulos.md), remite aquí.

La lectura sigue este orden: carpeta origen del 17 de octubre (`HAVECTRL_V05_Operations_Services.pdf`), Control de cambio 1 (carpeta Operation Services del 6 de noviembre) y el prototipo. El volumen 05 y el prototipo describen el mismo ciclo manual. El prototipo añade historial de revisión, beneficiario verificado y cantidades de entrega. Este corte registra la obligación y el pago. El historial de versiones y la verificación del beneficiario quedan para el cierre siguiente del mismo módulo.

## Qué entra

Cinco pestañas: Flight Overview, Airport Fees, Operational Services, Payments y Documents & Expenses.

Flight Overview cuenta tasas, servicios, gastos y pagos. Entrar a la vista no abre el primer registro.

Airport Fees registra proveedor, aeropuerto, importe, moneda y, si aplica, el vuelo ya existente y el enlace oficial del ente. Operational Services registra combustible, handling, catering, transporte, HOTAC u otro. El estado nace en solicitado y puede guardarse como cotizado, confirmado, recibido o cancelado.

Documents & Expenses es el alta del gasto. El autor sale de la sesión. El autor no aprueba su propio gasto. Otra persona lo aprueba cuando el gasto está presentado.

Payments liquida una tasa, un servicio o un gasto ya registrado. La moneda coincide con la obligación. Un pago confirmado no puede pasar el saldo. Registrar el pago no crea otro gasto. HAVECTRL guarda el enlace `http` o `https` y el comprobante declarado. No mueve el dinero.

El importe es mayor que cero. USD, EUR y VES no se suman entre sí.

## Qué no entra

Pasarela de pago, correo, impresión, reparto de un importe entre tramos, beneficiario verificado, cantidades de combustible entregadas y el historial de versiones del prototipo.

## Rutas

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/operations/services` | Tasas y servicios vivos |
| `POST` | `/operations/services` | Alta |
| `GET` | `/operations/expenses` | Gastos vivos |
| `POST` | `/operations/expenses` | Alta, con el autor de la sesión |
| `PUT` | `/operations/expenses/:id/status` | Cambia el estado. Rechaza la autoaprobación |
| `GET` | `/operations/payments` | Pagos vivos |
| `POST` | `/operations/payments` | Liquida una obligación, sin crear otro gasto |

Migración `011_operations_payments.sql`.
