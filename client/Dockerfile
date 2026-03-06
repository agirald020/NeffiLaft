# Build stage
FROM node:21-slim AS builder

WORKDIR /app

# Copy package files from root (only package.json to avoid lock file issues)
COPY package.json ./

# Install dependencies (fresh install for Linux environment)
RUN npm install --legacy-peer-deps

# Copy vite config for docker build
COPY vite.config.docker.ts ./
COPY vite.config.ts ./

# Copy client source code
COPY client ./client
COPY shared ./shared
COPY attached_assets ./attached_assets

# Build application (only client/frontend with Vite)
RUN npx vite build --config vite.config.docker.ts

# Runtime stage
FROM node:21-slim

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built files from builder (from dist/public where Vite outputs based on vite.config.ts)
COPY --from=builder /app/dist/public ./

# Expose port
EXPOSE 3000

# Run the application
CMD ["serve", "-s", ".", "-l", "3000"]
