# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy shared package first (api depends on it)
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src/

# Copy api package
COPY packages/api/package.json ./packages/api/
COPY packages/api/tsconfig.json ./packages/api/
COPY packages/api/prisma ./packages/api/prisma/
COPY packages/api/src ./packages/api/src/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared first
RUN pnpm --filter @npk/shared build

# Generate Prisma client
RUN cd packages/api && npx prisma generate

# Build API
RUN pnpm --filter @npk/api build

# ─── Stage 2: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# Copy only what's needed to run
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/node_modules ./node_modules
COPY --from=builder /app/packages/api/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create logs directory
RUN mkdir -p logs

EXPOSE 3001

CMD ["node", "dist/index.js"]
