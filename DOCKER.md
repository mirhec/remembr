# Remembr - Text Memorization App

A web application to assist with memorizing texts. Features include text management, practice functionality, user authentication, responsive design with PWA support, and dark/light theme support.

## Docker Deployment

### Running with Docker

You can run Remembr using the pre-built Docker image from GitHub Container Registry:

```bash
docker run -p 3000:3000 \
  -v ./data:/data \
  ghcr.io/USERNAME/remembr:latest
```

Replace `USERNAME` with the appropriate GitHub username.

### Environment Variables

The following environment variables can be used to configure the application:

- `SQLITE_DB_PATH`: Path to the SQLite database file (default: `/data/sqlite.db`)
- `NEXTAUTH_SECRET`: Secret used for authentication (should be changed in production)
- `NEXTAUTH_URL`: URL where the application is hosted (e.g., `https://your-domain.com`)

### Example: Custom Configuration

```bash
docker run -p 3000:3000 \
  -v /path/to/your/data:/data \
  -e SQLITE_DB_PATH=/data/custom-database.db \
  -e NEXTAUTH_SECRET=your-secure-secret-key \
  -e NEXTAUTH_URL=https://remembr.example.com \
  ghcr.io/USERNAME/remembr:latest
```

## Development Setup

### Prerequisites

- Node.js (recommended: v18+)
- Yarn or npm

### Install Dependencies

```bash
yarn install
```

### Run Development Server

```bash
yarn dev
```

### Build for Production

```bash
yarn build
yarn start
```
