# Rediseño Analógico (70s-90s), Gestos Táctiles y Capa de Asistencia Administrativa

Este documento describe la arquitectura, componentes y patrones implementados en la modernización visual y funcional de ARCHIVOS NAVA.

---

## 1. Identidad Visual Analógica (70s–90s)

Se diseñó un lenguaje visual de revista y cuarto oscuro fotográfico de las décadas de 1970 a 1990:

- **Paletas de color duales**:
  - `Cuarto oscuro` (modo oscuro): Fondo carbón profundo (`#0d0c0a`), superficies cálidas con sutil grano de película SVG procedural y acentos ámbar de luz de seguridad (`#dfa960`).
  - `Papel algodón` (modo claro): Fondo marfil/lino (`#f5f0e6`), superficies estilo ficha de catálogo física (`#fbf8f2`) y tintas marrones analógicas (`#8c5a2b`).
- **Composición de "Hoja de contactos"**:
  - Encabezados de fotograma con número de toma (`FRM 01/24`), código de referencia documental y sellos tipográficos (`ARCHIVO PRESERVADO`).
- **Tipografías**:
  - Títulos y citas editoriales: *Newsreader* (serif).
  - Cuerpo e interfaz: *Plus Jakarta Sans* (sans-serif).
  - Metadatos, códigos de negativo y controles: *JetBrains Mono* (monoespaciada).

---

## 2. Navegación Global de Categorías y Selector en Detalle

- **Desplegable global de categorías ([PublicShell.astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/components/PublicShell.astro))**:
  - Presente en todas las vistas del sitio público.
  - Ofrece acceso inmediato a todas las colecciones con conteo de fotos y accesos directos tanto a la primera foto del rollo como a la grilla completa.
  - Se adapta en dispositivos móviles a un panel fijo centrado con ancho relativo a `dvw` para evitar recortes en bordes.
- **Selector de rollo en vista de fotografía ([photo/[id].astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/pages/photo/[id].astro))**:
  - Permite al usuario cambiar de categoría/rollo directamente desde la mesa de luz sin tener que volver atrás a la galería.

---

## 3. Gestos Táctiles (Swipe) en Mesa de Luz

- **Seguimiento 1:1 en tiempo real (`attachSwipeSurface`)**:
  - Tanto en la mesa de luz como en el visor a pantalla completa (Lightbox), arrastrar horizontalmente con el dedo desplaza la imagen en tiempo real acompañando el movimiento táctil.
  - Deslizar hacia la izquierda avanza a la siguiente foto del rollo; deslizar hacia la derecha regresa a la anterior.
  - En los extremos del rollo (primera o última toma) aplica una amortiguación elástica (*rubber-band*).
- **Prevención de colisiones**:
  - Respeta el desplazamiento vertical (`touch-action: pan-y pinch-zoom`) y gestos de ampliación con dos dedos (`visualViewport.scale > 1.05`).
  - Suprime eventos sintéticos de `click` tras un arrastre horizontal para no abrir accidentalmente el visor al soltar.
- **Indicadores visuales**:
  - Píldoras laterales en los bordes (`← Anterior` / `Siguiente →`) y barra táctil compacta para pantallas pequeñas (`← Anterior | ⇄ Deslizá la foto | Siguiente →`).
  - Precarga anticipada mediante `<link rel="prefetch">` de las fotos contiguas.

---

## 4. Adaptabilidad Responsiva sin Desborde

- **Corrección de eje Flexbox en toolbar de administración**:
  - Se sustituyó la estructura `display: flex; flex-wrap: wrap;` por **CSS Grid** responsivo en `/admin/photos` y `/search`. Esto previene el bug de inversión de eje en pantallas móviles donde `flex-basis: 100%` en dirección columna estiraba verticalmente los campos y desbordaba el año horizontalmente fuera de la pantalla.
- **Tarjetas apiladas con `@container` queries**:
  - La tabla de categorías (`/admin/categories`) utiliza `@container (width < 660px)` para convertirse automáticamente en tarjetas individuales con etiquetas generadas por CSS (`::before`), garantizando legibilidad y accesibilidad en cualquier tamaño de pantalla.

---

## 5. Capa de Asistencia y Tooltips (Admin Only)

Toda la ayuda contextual está delimitada exclusivamente al panel administrativo (`/admin/*`), manteniendo el catálogo público limpio y sin ruido visual.

- **Interruptor global ([HelpToggle.astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/components/HelpToggle.astro))**:
  - Permite a usuarios experimentados desactivar con un clic todos los carteles y botones `?`.
  - Persiste en `localStorage ('nava_help_mode')` y se sincroniza entre pestañas.
- **Toggletips accesibles ([HelpTip.astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/components/HelpTip.astro))**:
  - Implementados con Popover API estándar (`popover="hint"` con fallback a `"auto"`), `interestfor`, `role="tooltip"`, `aria-describedby` y cierre por `Escape`.
- **Carteles de asistencia contextuales ([HelpBanner.astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/components/HelpBanner.astro))**:
  - Tarjetas descartables con memoria en `localStorage ('nava_dismissed_tips')`.
  - Explican pautas archivísticas en `/admin/photos` (búsqueda y bulk actions), `/admin/photos/new` (carga múltiple y personas en descripción), `/admin/categories` (orden numérico por saltos de 10 y slugs), y pantallas de configuración.
