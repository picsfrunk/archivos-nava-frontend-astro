# Identidad configurable, tema y panel avanzado

## Configuración pública

`src/lib/site-settings.ts` contiene el contrato público, el fallback y las
consultas. El GET a `/api/archivos-nava/site-settings` tiene timeout de 5 segundos
y no usa caché HTTP. `getSiteSettings(Astro.request)` comparte una promesa por
request mediante WeakMap: página, layout y header hacen una única consulta y
los cambios aparecen en la siguiente navegación/recarga. Un fallo exclusivo de
settings no impide renderizar: nombre `ARCHIVOS NAVA`, descripción/logo vacíos,
tema `dark`. Esto no reemplaza el manejo existente de errores de fotos/categorías.
El panel usa la consulta estricta para evitar editar valores de fallback.

La proyección pública no incluye ni utiliza el public ID de Cloudinary.
Los logos Cloudinary se solicitan con `f_auto,q_auto,c_limit,w_480,h_160`;
se conserva la proporción, el alt usa el nombre y la marca textual sigue visible.
No hay editor de URL ni credenciales Cloudinary en el navegador.

## Autorización y panel

`/admin/advanced/settings` utiliza la sesión local PocketBase existente.
Refresca una sesión válida de `admins` y comprueba `role === owner` antes de
mostrar el formulario. El enlace de AdminShell empieza oculto y sólo se muestra
tras refrescar un owner. Un admin recibe acceso denegado; sin sesión redirige a
login. El HTML inicial sólo contiene la estructura vacía del formulario, sin
información privada. La autorización efectiva de cada escritura vive en
`requireOwner` del backend; manipular la UI no concede permisos.

Nombre, descripción y tema se guardan con PATCH. Logo usa POST/DELETE en
`/api/archivos-nava/site-settings/logo`. Las operaciones bloquean ambos formularios
para evitar doble envío y muestran estado/resultado. Quitar logo requiere
confirmación. Se mantienen los cambios de texto todavía no guardados durante
las operaciones del logo. La pantalla se organiza en una columna en móvil.

## Tema

Prioridad: `localStorage['archive-theme']` válido > `default_theme` backend >
resolución de `system` con `prefers-color-scheme`. Oscuro es el fallback.
El selector permite Oscuro, Claro, Según dispositivo y Predeterminado (borra
el override y vuelve a la configuración de la instancia). `system` responde
al cambio del SO; se sincronizan cambios de preferencia entre pestañas.
Storage bloqueado/corrupto no impide renderizar ni cambiar tema en la página.

Un script inline en head aplica el tema antes del cuerpo para evitar destellos.
El HTML inicial ya respeta el default claro/oscuro. Tokens: `--background`,
`--background-secondary`, `--surface`, `--text`, `--text-secondary`, `--border`,
`--accent`, `--header-background`. Se migraron los colores de los componentes
públicos existentes sin cambiar su estructura. Lightbox permanece oscuro.
El admin conserva su estética. No se agregaron dependencias.

## Identidad reemplazada

Marca del header, nombre/descripción opcional de home, título/metadata del layout,
home, listado de galerías, categoría y detalle de foto. El alt genérico de fotos
ahora dice “Fotografía de archivo” en render inicial y carga posterior.
Los textos internos del admin y el favicon permanecen fuera de esta etapa.

## Pruebas

- `npm run build`: correcto.
- `node --test tests/theme.test.cjs`: 8 casos sobre el script real de inicialización.
- Chrome headless, desktop 1440, tablet 768, móvil 390 y estrecho 320.
- Login owner/admin, enlace owner, URL directa denegada, anónimo a login.
- Guardado de nombre/descripción/theme; upload, reemplazo y borrado real de logo
  con Cloudinary, confirmación/cancelación y retorno a marca textual.
- Nombre/logo/descripción públicos y metadata; dark/light persistentes,
  system dinámico sin override y como elección explícita; reset a default.
- Un proxy de prueba devolvió 503 sólo para settings: home respondió con fallback;
  contador confirmó un GET total entre página/layout/header en la misma respuesta.
- Carga múltiple real de dos fotos como admin normal, edición, categorías,
  portadas de home/categoría, orden, papelera, exclusión pública y restauración.
- Galería, detalle, enlaces anterior/siguiente, lightbox y descarga HTTP real.
- Paginación real de 24 a 25 fotografías con año y sin errores JavaScript.
- Revisión visual de panel y público en desktop/móvil; sin errores JavaScript
  en los recorridos de branding y regresión.

Los datos/cuentas y assets utilizados fueron temporales, fuera de `pb_data` del
proyecto. Los scripts de automatización local no guardan credenciales de producción.

## Correcciones de integración

Las flechas sobre select/input/textarea no disparan navegación entre fotos.
El script de “Cargar más” importa `displayYear`, que antes usaba sin importarlo.
No cambia la semántica de fotos ni categorías.

## Operación y límites

Desplegar primero el backend de la misma etapa. Mantener `PUBLIC_POCKETBASE_URL`
correcto para compilación y SSR y usar `npm run start` (conserva el workaround
existente `ASTRO_NODE_LOGGING=disabled` del adaptador Astro/Node).
No hay sincronización en vivo de identidad en páginas ya abiertas: recargar.
La recuperación de fallos entre Cloudinary y SQLite está documentada en el
backend; no se introduce una cola de limpieza automática. No incluye búsqueda,
acciones masivas, favicon configurable ni rediseño integral.
