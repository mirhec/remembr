# Base image: Node.js 18 (LTS) on Alpine Linux for a small image size
FROM node:24-alpine AS base

# Set working directory in the container
WORKDIR /app

# Install dependencies for Alpine
# Python and build tools are needed for native NPM modules (like sqlite3)
RUN apk add --no-cache python3 make g++ git

# Copy package.json and yarn.lock (if available)
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build NextJS application for production
RUN yarn build

# Create persistence directory for the SQLite database
RUN mkdir -p /data

# Add environment variable for the SQLite file path (can be overridden)
ENV SQLITE_DB_PATH=/data/sqlite.db

# Environment variable for NextAuth secret (should be overridden in production deployment)
ENV NEXTAUTH_SECRET=71b8378ab4cb0d8f67ef6a0fa7874114169c99e6d3b879ca407b77d14e0c

# Port on which the application will run
ENV PORT=3000
EXPOSE 3000

# Set start command
CMD ["yarn", "start"]
