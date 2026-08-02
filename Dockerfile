# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json ./
RUN npm install

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DEPLOY_ENV=development
ENV DEPLOY_ENV=$DEPLOY_ENV
ENV NODE_ENV=production

ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG AUTH_SECRET
ARG AUTH_AZURE_AD_CLIENT_ID
ARG AUTH_AZURE_AD_CLIENT_SECRET
ARG AUTH_AZURE_AD_ISSUER
ARG AUTH_AZURE_AD_AUDIENCE
ARG AUTH_URL
ARG AUTH_AZURE_AD_JWKS_URI

ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN
ENV AUTH_SECRET=$AUTH_SECRET
ENV AUTH_AZURE_AD_CLIENT_ID=$AUTH_AZURE_AD_CLIENT_ID
ENV AUTH_AZURE_AD_CLIENT_SECRET=$AUTH_AZURE_AD_CLIENT_SECRET
ENV AUTH_AZURE_AD_ISSUER=$AUTH_AZURE_AD_ISSUER
ENV AUTH_AZURE_AD_AUDIENCE=$AUTH_AZURE_AD_AUDIENCE
ENV AUTH_URL=$AUTH_URL
ENV AUTH_AZURE_AD_JWKS_URI=$AUTH_AZURE_AD_JWKS_URI

RUN npm run build

# ============================================
# Stage 3: Runner
# ============================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DEPLOY_ENV=development
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
ENV CUSTOMS_DB_PATH=/app/data/customs-declarations.db

RUN apk add --no-cache libc6-compat \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /app/data \
  && chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# better-sqlite3 is externalized; ensure native module is present for standalone
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

COPY --chown=nextjs:nodejs data/customs-declarations.db /app/data/customs-declarations.db

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
