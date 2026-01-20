# Docker Deployment Issues and Fixes

## Current Status

### Working Components:
- ✅ Database container: Healthy and running
- ✅ API container: Running and serving requests
- ❌ Website container: Failed to start (Exit 1)

## Identified Issues

### 1. Website Container Issue
**Error**: `host not found in upstream "api" in /etc/nginx/conf.d/default.conf:14`

**Root Cause**: The nginx configuration file uses `http://api:3000` as the upstream server, but nginx cannot resolve the hostname "api" during startup because:

1. The nginx configuration is processed before the container joins the Docker network
2. The hostname "api" is not resolvable in the nginx container's context
3. The website container needs to be able to resolve the API service name

### 2. API Health Check Issue
**Status**: The API container shows "health: starting" which suggests the health check might not be working properly.

**Root Cause**: The API health check uses `curl -f http://localhost:3000/` but the API endpoint is actually `/api/health`.

## Solutions

### Fix 1: Update nginx.conf to use environment variables

```nginx
server {
    listen 80;
    server_name localhost;

    # Serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the backend container
    location /api/ {
        proxy_pass http://$API_HOST:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Fix 2: Update docker-compose.yaml for website service

```yaml
website:
  build:
    context: ./Public
    dockerfile: website.dockerfile
  ports:
    - "8080:80"
  networks:
    - business-network
  environment:
    - API_HOST=api
    - API_PORT=3000
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:80/"]
    interval: 30s
    timeout: 10s
    retries: 3
  depends_on:
    - api
```

### Fix 3: Update API health check in docker-compose.yaml

```yaml
api:
  build:
    context: .
    dockerfile: api.Dockerfile
  ports:
    - "3000:3000"
  environment:
    - DB_HOST=db
    - DB_USER=myuser
    - DB_PASSWORD=mypassword
    - DB_NAME=businessform_db
    - DB_PORT=5432
  depends_on:
    - db
  networks:
    - business-network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Fix 4: Update website.dockerfile to use envsubst

```dockerfile
FROM nginx:latest
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["sh", "-c", "envsubst '$API_HOST $API_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
```

## Implementation Steps

1. **Update nginx.conf**: Replace `http://api:3000` with `http://$API_HOST:$API_PORT`
2. **Update website.dockerfile**: Add environment variable substitution
3. **Update docker-compose.yaml**: Add environment variables and dependencies for website service
4. **Update API health check**: Change health check endpoint to `/api/health`

## Alternative Quick Fix

If you need a quick solution without modifying the nginx configuration, you can:

1. Update the website service in docker-compose.yaml to use `extra_hosts`:

```yaml
website:
  # ... existing config ...
  extra_hosts:
    - "api:host-gateway"
```

2. Or use the API container's IP address directly in nginx.conf.

## Verification

After applying these fixes:

1. Rebuild containers: `docker-compose build`
2. Restart services: `docker-compose down && docker-compose up -d`
3. Check status: `docker-compose ps`
4. Verify health: `docker-compose logs`
5. Test endpoints:
   - Website: `http://localhost:8080`
   - API: `http://localhost:3000/api/health`
   - Database: Should be accessible from API container

## Additional Recommendations

1. Consider adding proper error handling and retries in the website container startup
2. Implement proper service discovery using Docker's internal DNS
3. Add proper logging and monitoring for all containers
4. Consider using Docker Compose health checks with proper dependencies
