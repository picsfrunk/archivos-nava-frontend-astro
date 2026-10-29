# Pulido Editorial y Experiencia Visual Pública

Este documento describe la identidad visual, tipografía y componentes estilísticos introducidos en el sitio público de **ARCHIVOS NAVA**, alineados con la visión de producto (70% archivo fotográfico/museo y 30% revista cultural).

---

## 1. Tipografía y Paleta de Superficies

- **Pila tipográfica serif editorial**: Se define `--font-serif` (`Cinzel, "Playfair Display", Georgia, "Times New Roman", serif`) para encabezados principales, títulos de exposiciones y placas de catalogación, complementando la fuente sans-serif geométrica para navegación y panel de administración.
- **Tonalidades cálidas de museo**: Fondo oscuro con matices neutros (`#10100f` / `#171716`), bordes sutiles con transparencia (`rgba(255, 255, 255, 0.12)`), y detalles dorados/sepia suaves (`#e6d5b8`) para insignias y detalles de portada.

---

## 2. Montaje Fotográfico (Photo Cards)

En `src/components/PhotoCard.astro`:

- **Marco de paspartú fotográfico** (`.photo-card-media`): Contenedor con relación de aspecto estandarizada (4:3) que enmarca las imágenes sobre fondo neutro oscuro.
- **Metadatos jerárquicos**: El año se presenta con insignia sobria, el título se restringe a dos líneas máximas (`-webkit-line-clamp: 2`) y la categoría se visualiza con espaciado tipográfico amplio (`letter-spacing: 0.12em`).
- **Elevación sutil**: Transiciones suaves al posar el cursor (`hover`), enfatizando el carácter expositivo de cada pieza fotográfica.

---

## 3. Experiencia Home y Portada Principal

En `src/pages/index.astro`:

- **Encabezado institucional**: Subtítulo de colección (*"Archivo & Colección Fotográfica"*), titular editorial con serif y breve introducción curatorial.
- **Vitrina de portada principal** (`.hero-showcase`):
  - Montura de exhibición museográfica con relación de aspecto 16:9 y borde protector.
  - Placa de identificación (`.hero-plate`) con etiqueta dorada de *"Fotografía de portada"*, título destacado, año y enlace a su categoría.
  - Estado vacío informativo (*"Catálogo en preparación"*) si aún no existen fotografías publicadas en el archivo.

---

## 4. Ficha de Detalle de Fotografía

En `src/pages/photo/[id].astro`:

- **Montura de exhibición** (`.photo-mount`): Presentación centrada con fondo oscuro y badge de *zoom* para apertura rápida del visor ampliado (*lightbox*).
- **Ficha técnica de catalogación** (`.catalog-metadata`):
  - Bloque estructurado con Año de registro, Categoría de pertenencia e Identificador de archivo.
  - Epígrafe y descripción histórica destacados en bloque de lectura cómodo.
- **Acciones y navegación**: Botones accesibles de *"Ver grande"*, *"Descargar"* y *"Volver a {categoría}"*, acompañados por tarjetas de navegación anterior y siguiente dentro de la misma categoría.

---

## 5. Búsqueda y Navegación por Categorías

En `src/pages/gallery/index.astro`, `src/pages/gallery/[slug].astro` y `src/pages/search.astro`:

- Cuadrículas adaptables y homogéneas con preservación semántica para accesibilidad y pruebas automatizadas (`role="status"`, `form[role="search"]`, `dialog`).
- Contadores de piezas catalogadas y estados vacíos claros cuando no hay coincidencias de búsqueda.

---

## Validación

```sh
npm run build
node --test tests/*.test.cjs
```
