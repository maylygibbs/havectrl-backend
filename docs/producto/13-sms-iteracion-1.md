# SMS — iteración 1

Alcance de SMS en la primera iteración. El corte sigue en [04-apis-e-iteraciones.md](04-apis-e-iteraciones.md). La ficha del módulo, en [03-modulos.md](03-modulos.md), remite aquí. La duda 1 de [05-dudas.md](05-dudas.md) sigue abierta: no se amplía la lectura del expediente.

La lectura sigue este orden. El volumen de SMS del origen (14 oct 2026, encabezado interno volumen 09) describe siete pestañas y dice que el texto no certifica cumplimiento OACI. Control de cambio 1 tiene la carpeta SMS del 6 de noviembre. El prototipo arma las siete pestañas y además contempla un jefe de operaciones designado y un permiso aparte para ver la identidad. Esa ampliación no entra mientras la duda siga abierta.

## Qué entra

Cualquier perfil con el módulo puede enviar un reporte: título, relato y severidad baja, media o alta. El formulario abre vacío. Enviar no selecciona un reporte.

El envío anónimo guarda el relato y deja el correo en blanco. El listado también oculta el correo cuando el reporte es anónimo.

El expediente original lo consultan el administrador y el jefe de SMS. El resto ve el canal de envío y el aviso de reserva. Home no muestra el contador a quien no puede leer el expediente. La búsqueda del listado no recorre el relato ni el correo.

Quien lee el expediente puede pasar un reporte de abierto a en revisión y a cerrado. Cerrarlo no lo envía a una autoridad y no libera una aeronave.

## Qué no entra

Registro de riesgos, planes de acción, documentos de seguridad, aseguramiento, formación SMS, designación de otro cargo para leer el original y el permiso separado para revelar identidades. Esas piezas están en el manual y en el prototipo. No se copian a este corte.

## Rutas

| Método | Ruta | Efecto |
| --- | --- | --- |
| `GET` | `/sms/reports` | Expediente. Vacío si el perfil no puede leerlo |
| `POST` | `/sms/reports` | Alta. El anónimo no guarda el correo |
| `PUT` | `/sms/reports/:id/status` | Cambia el estado. Reservado al mismo par de perfiles |
