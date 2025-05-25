# syntax=docker.io/docker/dockerfile:1

FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Clean yarn cache before installing to save space
RUN yarn cache clean

# Install only production dependencies to save space
COPY package.json yarn.lock* ./
RUN yarn install --production --frozen-lockfile --network-timeout 100000


# Stage for dev dependencies and build
FROM base AS builder
WORKDIR /app

# Install the minimum required build dependencies
RUN apk add --no-cache python3 make g++

# First copy only package files and install dev dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN yarn build

# Production image, minimal footprint
FROM node:24-alpine AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production
# Disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Add non-privileged user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create persistence directory for SQLite with proper permissions
RUN mkdir -p /data && chown nextjs:nodejs /data

# Install SQLite and additional dependencies for database initialization
RUN apk add --no-cache sqlite-libs sqlite

# Install SQLite modules needed for the database initialization script
RUN npm install --no-save sqlite sqlite3 path fs

# Set environment variables
ENV SQLITE_DB_PATH=/data/sqlite.db
ENV NEXTAUTH_SECRET=71b8378ab4cb0d8f67ef6a0fa7874114169c99e6d3b879ca407b77d14e0c
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV AUTH_TRUST_HOST=localhost:3000

# Copy only the necessary production files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create scripts directory and copy database initialization script
RUN mkdir -p ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/scripts/init-db.js ./scripts/init-db.js

# Use non-root user
USER nextjs

EXPOSE 3000

# Initialize database and start the server
CMD ["/bin/sh", "-c", "node scripts/init-db.js && node server.js"]
