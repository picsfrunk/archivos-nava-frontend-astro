# ==============================================================================
# ARCHIVOS NAVA — Frontend Astro SSR Dockerfile
# Multi-stage production build using Node 22 on Alpine Linux
# ==============================================================================

# --- Stage 1: Dependencies and Build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies required for clean reproducible build
COPY package*.json ./
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build arguments for frontend build
ARG PUBLIC_POCKETBASE_URL
ENV PUBLIC_POCKETBASE_URL=${PUBLIC_POCKETBASE_URL}

# Build server bundle and static client assets
RUN npm run build

# Remove development dependencies to keep production footprint minimal
RUN npm prune --production

# --- Stage 2: Production Runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
ENV ASTRO_NODE_LOGGING=disabled

# Create writable directory for session storage under node user
RUN mkdir -p /app/node_modules/.astro /app/dist && chown -R node:node /app

# Copy built runtime and production dependencies from builder stage
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

# Security: Run as unprivileged node user
USER node

EXPOSE 4321

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1

CMD ["node", "dist/server/entry.mjs"]
