# Multi-Environment Setup for Same Client

## Architecture Overview

```
Docker Host Server
│
├── Client A - Dev     (port 3010) → dev.client-a.victoury.com
├── Client A - Staging (port 3011) → staging.client-a.victoury.com
├── Client A - Prod    (port 3012) → api.client-a.victoury.com
│
├── Client B - Dev     (port 3020) → dev.client-b.victoury.com
├── Client B - Prod    (port 3021) → api.client-b.victoury.com
│
└── Internal - Dev     (port 3000) → dev.internal.victoury.com
```

## Naming Convention

**Pattern**: `{client}-{environment}`

- `client-a-dev`
- `client-a-staging`
- `client-a-prod`
- `client-b-dev`
- `client-b-prod`

## Complete Setup Example

### 1. Create environment files:
```bash
# Client A environments
cp envs/example.env envs/client-a-dev.env
cp envs/example.env envs/client-a-staging.env
cp envs/example.env envs/client-a-prod.env

# Edit each with appropriate credentials
```

### 2. Deploy all Client A environments:
```bash
./scripts/deploy.sh client-a-dev
./scripts/deploy.sh client-a-staging
./scripts/deploy.sh client-a-prod
```

### 3. Check status:
```bash
./scripts/manage-all.sh status

# Output:
✓ client-a-dev:
  Container: victoury-mcp-client-a-dev-server
  Status: Up 2 minutes (healthy)
  Ports: 0.0.0.0:3010->3000/tcp

✓ client-a-staging:
  Container: victoury-mcp-client-a-staging-server
  Status: Up 1 minute (healthy)
  Ports: 0.0.0.0:3011->3000/tcp

✓ client-a-prod:
  Container: victoury-mcp-client-a-prod-server
  Status: Up 30 seconds (healthy)
  Ports: 0.0.0.0:3012->3000/tcp
```

## Resource Considerations

Running multiple environments requires:
- **Memory**: ~256-512MB per container
- **CPU**: Minimal when idle
- **Disk**: Shared image, separate volumes

Example for 10 environments:
- Memory: 2.5-5GB total
- Disk: ~50MB per environment for logs

## Access Patterns

### Direct Access:
```bash
# Development
curl http://localhost:3010/health

# Production
curl http://localhost:3012/health
```

### Through Reverse Proxy:
```nginx
server {
    server_name dev.client-a.example.com;
    location / {
        proxy_pass http://localhost:3010;
    }
}

server {
    server_name client-a.example.com;
    location / {
        proxy_pass http://localhost:3012;
    }
}
```

## Best Practices

1. **Naming Convention**: Always use `{client}-{env}` pattern
2. **Port Allocation**: Reserve port ranges
   - 3000-3009: Internal
   - 3010-3019: Client A
   - 3020-3029: Client B
   - etc.

3. **Environment Isolation**:
   - Separate Docker networks per environment
   - Different log volumes
   - No shared data between environments

4. **Monitoring**: Use container names in monitoring
   ```bash
   # Monitor specific environment
   docker stats victoury-mcp-client-a-prod-server
   
   # Monitor all Client A
   docker stats $(docker ps --format "{{.Names}}" | grep "client-a")
   ```

## Quick Commands

```bash
# Deploy single environment
./scripts/deploy.sh client-a-dev

# Stop single environment
./scripts/stop.sh client-a-dev

# View logs
./scripts/manage-all.sh logs client-a-dev

# Deploy all Client A environments
for env in dev staging prod; do
  ./scripts/deploy.sh client-a-$env
done

# Status of all
./scripts/manage-all.sh status
```