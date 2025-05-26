# Deployment Instructions

## Setting Up Your Production Environment

When deploying Remembr to a production environment with a custom domain, you need to ensure that the authentication system can work correctly across domains. Follow these steps:

## 1. Environment Variables

Ensure the following environment variables are set:

```
NEXTAUTH_URL=https://your-domain.com  # Replace with your actual domain
NEXTAUTH_SECRET=your-secure-secret-key
NODE_ENV=production
```

These can be set in a `.env` file for local development, but **must be explicitly set** in your production environment.

## 2. Using Docker

### Option 1: Docker Run Command

```bash
docker run -p 3000:3000 \
  -e NEXTAUTH_URL=https://remembr.your-domain.com \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e NODE_ENV=production \
  -v "$(pwd)/data:/data" \
  --name remembr-app \
  remembr-app
```

### Option 2: Docker Compose (Recommended)

Use the provided `docker-compose.yml` file:

```bash
docker compose up -d
```

This will automatically set the correct environment variables as defined in the compose file.

## 3. Reverse Proxy Configuration

If you're using a reverse proxy like Nginx or Traefik, ensure it correctly forwards headers to your application:

### Nginx Example

```nginx
server {
  listen 80;
  server_name remembr.your-domain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Troubleshooting

If authentication issues persist after setting up everything correctly:

1. Check that cookies are being properly set (examine in browser dev tools)
2. Verify that the NEXTAUTH_URL is exactly the same as your domain, including protocol
3. Ensure there are no mixed content issues (http/https)
4. If behind a reverse proxy, confirm all headers are forwarding correctly
