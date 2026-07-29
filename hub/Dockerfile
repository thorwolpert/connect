# ==========================================
# Stage 1: Build the Nuxt Application
# ==========================================
FROM node:22-slim AS builder

WORKDIR /app

# Install Python and C++ build tools for Debian Slim
# This guarantees SQLite can compile from source if the pre-built binary fails under Mac emulation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Enable pnpm natively using corepack
RUN corepack enable pnpm

# Copy only the package manifest and the pnpm lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Configure pnpm to allow postinstall scripts, then install dependencies
RUN pnpm config set ignore-scripts false && pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# THE FIX: Tell Node it's allowed to use 8GB of RAM for the build phase
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Build the Nuxt application (Compiles Markdown files directly into the SQLite index snapshot)
RUN pnpm run build

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:22-slim

WORKDIR /app

# Install the underlying shared operating system library needed for runtime SQLite stability
RUN apt-get update && apt-get install -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*

# Copy ONLY the compiled .output directory and the migrations from the builder stage
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/server/db/migrations ./server/db/migrations

# Establish server configurations for serverless execution
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Start the standalone Nitro Node server
CMD ["node", ".output/server/index.mjs"]
