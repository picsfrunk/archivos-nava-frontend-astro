# Búsqueda, filtros y selección por página

## Administración

`/admin/photos` conserva `search`, `category`, `year`, `status` y `page` en la URL. La búsqueda y el año esperan 350 ms; cada cambio invalida respuestas anteriores y limpia la selección de inmediato. Los filtros y la paginación crean historial y `popstate` restaura controles/listado. El año admite 1800–2100 y muestra un error legible; no se envía una búsqueda inválida.

Cada tarjeta tiene un checkbox independiente de Editar y las demás acciones. “Seleccionar todas las visibles” abarca sólo las 24 fotos de la página actual. El contador y la barra se mantienen visibles al desplazarse. La selección se limpia al cambiar filtros/página y después de una operación exitosa.

La barra ofrece Publicar, Pasar a borrador, Mover a papelera, Restaurar y Cambiar categoría. Restaurar aparece para selección con papelera; publicar/borrador/papelera para selección fuera de ella. La categoría de destino sólo incluye categorías activas no técnicas. Borrador y papelera requieren confirmación. Guardar bloquea envíos repetidos, acciones individuales y controles de navegación del listado. El resultado conserva filtros/página, informa actualizadas y omitidas, y distingue errores de guardado de errores al refrescar.

Los controles de reorder siguen disponibles al filtrar por categoría sin texto/año, para no mover fotos respecto a vecinas invisibles. El backend editorial existente no cambia. “Todas” conserva el comportamiento anterior y excluye papelera.

## Búsqueda pública

`/search` usa un formulario GET y paginación de 24 resultados con URL persistente. El enlace Buscar se añade al header compartido. Reutiliza `PhotoCard`, `isPublicPhoto` y el cliente público. Los filtros `published`, categoría activa y no técnica se aplican **antes de paginar**, incluso si existe una sesión administrativa. Categoría y año son opcionales; texto busca title/caption/description con parámetros escapados de PocketBase.

Con categoría se conserva el orden editorial; sin ella se ordena por creación, con ID como desempate. La ruta usa branding y tema configurables. Los errores de validación devuelven 400; indisponibilidad, 503 con texto humano. No hay autocomplete, ranking, servicios externos ni rediseño general.

## Validación reproducible

```sh
npm run build
node --test tests/theme.test.cjs
```

Para las pruebas de navegador se requiere Playwright y Chrome instalados en el entorno de pruebas; no se agregan dependencias de ejecución al sitio.

1. En backend: `UI_FIXTURE=/tmp/nava-fixture.json node --test tests/search-bulk.test.cjs`. Mantener este proceso abierto.
2. En frontend: `PUBLIC_POCKETBASE_URL=http://127.0.0.1:18091 npm run build`.
3. En frontend: `PUBLIC_POCKETBASE_URL=http://127.0.0.1:18091 HOST=127.0.0.1 PORT=14321 npm start`.
4. Ejecutar en orden sobre la fixture nueva:

```sh
UI_FIXTURE=/tmp/nava-fixture.json node tests/search-bulk.browser.cjs
UI_FIXTURE=/tmp/nava-fixture.json node tests/bulk-actions.browser.cjs
```

Si Playwright está instalado fuera del proyecto, configurar `PLAYWRIGHT_MODULE` con su ruta. `FRONTEND_URL` cambia la URL local; `UI_ARTIFACT_DIR` el directorio existente para capturas (por defecto `/tmp`). Al terminar detener ambos servidores, quitar la fixture y ejecutar `npm run build` normalmente para restaurar el build local con la configuración habitual.

Cobertura: login real, debounce (un request al escribir una palabra), recarga e historial, paginación, limpieza de selección, las cinco acciones, 1440/820/390 px sin desbordamiento, búsqueda pública paginada, galería, detalle, anterior/siguiente, lightbox, enlace de descarga, carga múltiple desde el navegador, persistencia de tema, acceso owner y páginas administrativas existentes. El backend cubre upload múltiple mediante dos uploads, edición, papelera/restauración, borrado permanente/vaciado y portadas con el servicio de imágenes simulado.

## Límites de validación

No se realizaron transferencias reales a Cloudinary ni descarga del archivo remoto. Las imágenes de las capturas son placeholders de la fixture; el enlace de descarga y el lightbox se verifican en navegador. No hay pruebas de carga a escala de miles de registros. La búsqueda usa las reglas LIKE de PocketBase/SQLite y no normaliza acentos. La selección es únicamente de la página actual.
