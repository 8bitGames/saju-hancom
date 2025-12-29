# Use Bun official image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS build
COPY --from=install /app/node_modules node_modules
COPY . .
RUN bun build ./src/index.ts --outdir ./dist --target bun

# Production stage
FROM base AS release
COPY --from=install /app/node_modules node_modules
COPY --from=build /app/dist ./dist

# Run as non-root user
USER bun

# Expose port
EXPOSE 3001

# Start the server
CMD ["bun", "run", "./dist/index.js"]
