FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/server/package*.json ./packages/server/

RUN npm ci --workspace=packages/shared --workspace=packages/server

COPY packages/shared ./packages/shared
COPY packages/server ./packages/server

RUN npm run build --workspace=packages/shared && \
    npm run build --workspace=packages/server

# ---- production image ----
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/server/package*.json ./packages/server/

RUN npm ci --omit=dev --workspace=packages/shared --workspace=packages/server

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist

ENV NODE_ENV=production
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "packages/server/dist/index.js"]
