# ==========================================
# Stage 1: Build the Nuxt Application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm natively using corepack
RUN corepack enable pnpm

# Copy package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Configure pnpm and install build dependencies
RUN pnpm config set ignore-scripts false && pnpm install --frozen-lockfile

# Copy application source code
COPY . .

# Set max memory limit for build phase
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Build the Nuxt application (bundles all server dependencies into .output/)
RUN pnpm run build

# ==========================================
# Stage 2: Production Runner (Google Distroless)
# ==========================================
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

# Copy ONLY compiled .output directory and DB migrations from builder stage
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/server/db/migrations ./server/db/migrations

# Set environment variables for Cloud Run execution
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Start standalone Nitro Node server (Distroless node binary is default entrypoint)
CMD [".output/server/index.mjs"]
