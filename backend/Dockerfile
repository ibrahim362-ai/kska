# =====================================================================
# Community Hub - Backend Dockerfile
# =====================================================================
# Multi-stage build: deps -> build -> runtime
# =====================================================================

# ---------- Stage 1: Install deps with caching ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --no-audit --no-fund

# ---------- Stage 2: Build TypeScript ----------
FROM deps AS build
WORKDIR /app
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# ---------- Stage 3: Runtime (production-only deps) ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl tini

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 5000

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
