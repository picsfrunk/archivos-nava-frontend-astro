# ARCHIVOS NAVA — Frontend Guidelines

## Development

```bash
# Run local dev server
npm run dev

# Build for SSR production
npm run build

# Preview production build locally
npm run preview
```

## Architecture & Conventions

- **Astro SSR Mode**: Uses `@astrojs/node` standalone adapter.
- **Code Language**: All code, function names, identifiers, variables, schemas, types, and comments must be strictly in **English**. User-facing text must be in **Spanish**.
- **Context & Rules**: Always follow `../ARCHIVOS-NAVA-CONTEXT.md`.
- **Public vs Admin**: The assistance/help layer (`HelpTip`, `HelpBanner`, `HelpToggle`) belongs strictly in `/admin/*`. Never introduce help banners or tooltips into public gallery views.
- **Verification**: Always run `npm run build` to ensure clean builds before submitting changes.
