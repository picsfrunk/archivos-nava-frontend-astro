# ARCHIVOS NAVA — Frontend (Astro SSR)

> Aplicación web pública y panel administrativo para el archivo fotográfico digital ARCHIVOS NAVA.

---

## 1. Tecnologías y Arquitectura

- **Framework**: [Astro](https://astro.build) (v7.2+) en modo **SSR** con el adaptador `@astrojs/node` standalone.
- **Estilos**: CSS nativo con variables de diseño analógico (paleta de cuarto oscuro y papel algodón), tipografías *Newsreader*, *Plus Jakarta Sans* y *JetBrains Mono*, animaciones sutiles y `@container` queries.
- **Interacciones Táctiles y Accesibilidad**:
  - Detección y arrastre 1:1 por gestos táctiles (Swipe) en la mesa de luz y el visor de fotografías ([photo/[id].astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/pages/photo/[id].astro)).
  - Navegación fluida por teclado (`←`, `→`, `F`, `Esc`).
  - View Transitions nativas para transiciones cinemáticas entre vistas.
- **Capa de Asistencia y Tooltips (Admin Only)**:
  - Sistema de ayuda interactivo restringido al panel administrativo (`/admin/*`).
  - Botón interruptor `[ ? Ayuda: Activa / Inactiva ]` en [AdminShell.astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/components/AdminShell.astro) con persistencia en `localStorage ('nava_help_mode')`.
  - Componente accesible [HelpTip.astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/components/HelpTip.astro) que utiliza la API de Popover (`popover="hint"` con fallback a `"auto"`), `interestfor`, hover, foco por teclado y `Escape`.
  - Carteles contextuales descartables [HelpBanner.astro](file:///Users/picsfrunk/Documents/GitHub/archivos-nava/archivos-nava-frontend-astro/src/components/HelpBanner.astro) con memoria de descarte en `localStorage ('nava_dismissed_tips')`.

---

## 2. Estructura del Código

```text
src/
├── components/
│   ├── AdminShell.astro       # Layout base para el panel de administración
│   ├── HelpBanner.astro       # Carteles contextuales de asistencia descartables
│   ├── HelpTip.astro          # Toggletip/Tooltip accesible con Popover API
│   ├── HelpToggle.astro       # Interruptor global para encender/apagar ayudas
│   ├── OwnerNav.astro         # Navegación para pantallas avanzadas de propietario
│   ├── PhotoCard.astro        # Tarjeta de fotograma para hojas de contacto
│   └── PublicShell.astro      # Encabezado, navegación y pie del sitio público
├── layouts/
│   └── Layout.astro           # Estructura HTML base, fuentes, metadatos y temas
├── lib/
│   ├── admin.ts               # Cliente y utilidades de autenticación administrativa
│   ├── help-layer.ts          # Motor de estado y sincronización de ayuda/tooltips
│   ├── pocketbase.ts          # Inicialización del cliente PocketBase SDK
│   ├── public-gallery.ts      # Consultas públicas de categorías, fotos y navegación
│   └── site-settings.ts       # Lectura de metadatos de identidad pública
└── pages/
    ├── index.astro            # Portada editorial principal
    ├── search.astro           # Buscador público por texto, año y rollo
    ├── gallery/
    │   ├── index.astro        # Índice de todas las colecciones/rollos
    │   └── [slug].astro       # Hoja de contactos y fotografías por rollo
    ├── photo/
    │   └── [id].astro         # Mesa de luz individual, zoom, swipe y switcher
    └── admin/
        ├── index.astro        # Redirección o dashboard administrativo
        ├── login.astro        # Inicio de sesión administrativo
        ├── photos/
        │   ├── index.astro    # Listado, filtros, selección en lote y papelera
        │   ├── new.astro      # Carga directa a Cloudinary con previsualizaciones
        │   └── edit.astro     # Edición de metadatos de fotografías
        ├── categories/
        │   └── index.astro    # ABM de categorías, ordenación y portadas
        └── advanced/
            ├── settings.astro # Identidad, nombre, temas y logo (rol owner)
            ├── backups.astro  # Gestión de respaldos SQLite y Cloudflare R2
            └── system.astro   # Métricas y estado del servidor
```

---

## 3. Variables de Entorno

| Variable | Tipo | Descripción |
| :--- | :--- | :--- |
| `PUBLIC_POCKETBASE_URL` | Obligatoria | URL pública de la API accesible desde el navegador del cliente (ej. `http://127.0.0.1:8090` en local o URL de producción en Railway). |
| `INTERNAL_POCKETBASE_URL` | Opcional | URL para llamadas directas SSR en red interna de Docker/Railway (ej. `http://archivos-nava-backend-pocketbase.railway.internal:8090`). |
| `PORT` | Opcional | Puerto HTTP en el que escucha Node (por defecto `4321` o asignado por Railway). |
| `HOST` | Opcional | Dirección de escucha (por defecto `0.0.0.0`). |

---

## 4. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:4321
npm run dev

# Compilar para producción (genera bundle SSR en ./dist/)
npm run build

# Previsualizar el build de producción localmente
npm run preview
```

---

## 5. Reglas de Contribución

- **Idioma de Código**: Todo el código (variables, funciones, componentes, tipos y comentarios) debe escribirse estrictamente en **inglés**. Los textos visibles para el usuario se redactan en **español**.
- **Reglas de Producto**: Consultar [ARCHIVOS-NAVA-CONTEXT.md](../../ARCHIVOS-NAVA-CONTEXT.md) antes de tomar decisiones a nivel de diseño o lógica.
