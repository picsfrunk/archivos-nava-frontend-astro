# Claridad en UX Administrativa y Gestión de Sesión

Mejoras de claridad editorial, experiencia de usuario y resiliencia de sesión en el panel administrativo.

## Selección de portada de categoría

En `/admin/categories`:

- Se reemplaza el control de selección técnico por una interfaz editorial con estados explícitos:
  - **Sin portada seleccionada**: indica con claridad que la categoría usará la primera foto publicada automáticamente según el orden editorial.
  - **Portada seleccionada**: muestra la miniatura de la foto actual, su título y metadatos, con acciones claras para *Cambiar foto* o *Quitar portada*.
- Al elegir portada se despliega un selector visual interactivo con miniaturas de las fotografías publicadas en la categoría, además de la opción rápida de restablecer el comportamiento automático.
- En la tabla de listado, la columna de portada exhibe insignias diferenciadas (*Automática* vs. título de portada asignada).
- Mantiene compatibilidad total con el contrato backend existente (`PATCH /api/archivos-nava/admin/categories/:id/cover`).

## Gestión y recuperación de sesión expirada

En `src/lib/admin.ts` y `/admin/login`:

- Las llamadas administrativas (`adminFetch` ante 401/403 o fallo de `requireAdminSession`) limpian el estado de autenticación y redirigen a `/admin/login?expired=1&redirect=...`.
- Se captura la ruta y parámetros previos para devolver al usuario a su trabajo tras iniciar sesión.
- `/admin/login` valida de forma estricta el parámetro de redirección (solo rutas relativas seguras que comiencen con `/admin` y no sean `/admin/login`), evitando bucles de redirección y vulnerabilidades de *open redirect*.
- Muestra de inmediato un aviso claro: *"Tu sesión ha expirado. Por favor, ingresá nuevamente."*.

## Feedback accesible de operaciones masivas y destructivas

En `/admin/photos`:

- El área de avisos se consolida en un banner de estado (`#admin-message-banner`) accesible (`role="status"`, `aria-live="polite"`), estilizado con bordes y contrastes específicos para estados de éxito, error y neutro.
- Incluye un botón para descartar el aviso de forma manual, conservando el texto exacto requerido por los contratos de prueba automatizada.

## Carga múltiple con tarjetas editoriales amplias y títulos individuales

En `/admin/photos/new`:

- **Dropzone auto-compactable**:
  - Estado inicial vacío: muestra un cuadro de arrastre amplio y claro con botón *"Seleccionar imágenes"*.
  - Estado con fotografías seleccionadas: se transforma automáticamente en una barra delgada y estilizada (~60px) para seguir arrastrando o sumando más fotos sin robar espacio vertical. Se elimina la vista previa redundante del dropzone.
- **Tarjetas editoriales con vista previa amplia (170×128 px)**:
  - Cada fotografía seleccionada pasa a ser una tarjeta completa y espaciosa con su número de orden (`#1`, `#2`, etc.), marco fotográfico nítido y botón de inspección/zoom ampliado al hacer clic.
  - Permite al usuario reconocer claramente a las personas, lugares y detalles de cada toma para escribir el título adecuado sin forzar la vista.
- **Títulos individuales por fotografía**: Cada foto cuenta con un campo de texto propio de 0.94rem con alto contraste, sugerencia automática del nombre de archivo limpio y sincronización fluida.
- **Herramientas de lote**: El panel derecho de datos comunes (Categoría, Año, Descripción) se mantiene estático (*sticky*) en pantallas de escritorio. Cuenta con el botón **"Aplicar este título a todas las fotos seleccionadas"** para nombrar eventos enteros en un clic.
- **Escalabilidad para 10+ fotos**: La lista de tarjetas cuenta con scroll vertical independiente estilizado (`max-height: calc(100vh - 300px)`), manteniendo fijos tanto los datos del lote como la barra de control superior (*"+ Agregar más fotos"*, *"Quitar todas"*).
- **Inspección en alta resolución (`<dialog>`)**: Al hacer clic en cualquier imagen o en su botón *"Ver grande"*, se despliega un visor modal que exhibe la fotografía en tamaño amplio antes de subirla.

## Carga múltiple y reintento individual

En `/admin/photos/new`:

- Cada fotografía que experimente un fallo durante la carga a Cloudinary/servidor ahora ofrece un botón de acción **Reintentar** en su fila de la lista.
- Permite reintentar la subida del archivo individual sin necesidad de volver a seleccionar las imágenes ni reiniciar todo el lote.

## Administración avanzada (Owner) y métricas de almacenamiento

En `/admin/advanced/*`:

- Se implementa el componente de sub-navegación tabulada `OwnerNav.astro` con tres áreas dedicadas:
  - **Identidad del sitio** (`/admin/advanced/settings`): Configuración pública del nombre, descripción, tema por defecto y carga/reemplazo de logotipo.
  - **Nube y Almacenamiento** (`/admin/advanced/system`): Visualización en tiempo real del uso de Cloudinary (bytes consumidos, cantidad de objetos/fotos remotas, tráfico de ancho de banda mensual, transformaciones generadas y porcentaje de créditos consumidos del plan). Además expone el resumen de base de datos local (fotos totales por estado y categorías activas).
  - **Copias de seguridad** (`/admin/advanced/backups`): Panel administrativo para consultar copias de seguridad locales de SQLite, generar respaldos transaccionales bajo demanda (`POST`), descargar archivos comprimidos (`.zip`) de forma segura en el navegador con autenticación Bearer, y eliminar copias antiguas con confirmación.
- Restringido estrictamente al rol `owner` de la colección `admins`.

## Validación

```sh
npm run build
node --test tests/*.test.cjs
```
