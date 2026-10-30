# ARCHIVOS NAVA Frontend — Production Deployment Guide

For full deployment instructions across the entire stack (PocketBase backend, Astro SSR frontend, and Caddy reverse proxy), see the root [DEPLOYMENT.md](../../DEPLOYMENT.md).

## Quick Summary

- **Dockerfile**: Multi-stage Node 22 on Alpine Linux.
- **Port**: 4321.
- **Runtime Mode**: Astro SSR with `@astrojs/node` standalone adapter.
- **Environment Variables**:
  - `PUBLIC_POCKETBASE_URL`: Public-facing PocketBase URL accessible by the browser (e.g. `https://archivos.example.com`).
  - `INTERNAL_POCKETBASE_URL`: Optional internal bridge network URL for server-side SSR calls (e.g. `http://backend:8090`).
  - `ASTRO_NODE_LOGGING`: Set to `disabled` for clean standalone server startup.
  - `PORT`: Server port (default: 4321).
  - `HOST`: Server host (default: 0.0.0.0).
