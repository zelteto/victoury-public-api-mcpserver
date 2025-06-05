# n8n Integration Setup Guide

## Quick Start

### 1. Build and Start Everything

```bash
# Clone repository
git clone https://github.com/yourorg/victoury-mcp-server.git
cd victoury-mcp-server

# Build the project
npm install
npm run build

# Setup environment files
cd deployment
cp envs/example.env envs/production.env
cp envs/example.env envs/staging.env
# Edit the .env files with your credentials

# Start n8n with Victoury MCP servers
docker-compose -f docker-compose.n8n.yml up -d
```

### 2. Access n8n

- URL: http://localhost:5678
- Username: admin
- Password: changeme

### 3. Import the Workflow

1. Open n8n
2. Create new workflow
3. Import from file: `n8n-integration/victoury-workflow.json`

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    n8n (Port 5678)                   │
│                                                      │
│  Workflows can call multiple MCP servers            │
└──────────────┬────────────────┬────────────────────┘
               │                │
               ▼                ▼
┌──────────────────────┐ ┌──────────────────────┐
│  MCP Prod (Port 3001) │ │ MCP Stage (Port 3002) │
│  ├─ production.env    │ │ ├─ staging.env        │
│  └─ Prod Victoury API │ │ └─ Stage Victoury API │
└──────────────────────┘ └──────────────────────┘
```

## Using in n8n Workflows

### Basic HTTP Request Node

```javascript
// Node: HTTP Request
{
  "method": "POST",
  "url": "http://victoury-mcp-prod:3000/tools/list_products",
  "authentication": "none",
  "sendBody": true,
  "bodyParameters": {
    "arguments": {
      "limit": 10,
      "page": 1
    }
  }
}
```

### With Dynamic Credentials

```javascript
// Node: Code
const environment = $input.first().json.environment || 'production';

const servers = {
  production: 'http://victoury-mcp-prod:3000',
  staging: 'http://victoury-mcp-staging:3000'
};

return {
  url: servers[environment],
  tool: 'list_products',
  arguments: {
    limit: 10
  }
};
```

## Advanced Workflows

### 1. Multi-Environment Product Sync

This workflow syncs products from staging to production:

```javascript
// Get products from staging
const stagingProducts = await $http.request({
  method: 'POST',
  url: 'http://victoury-mcp-staging:3000/tools/list_products',
  body: {
    arguments: { limit: 100 }
  }
});

// Process and sync to production
for (const product of stagingProducts.result.data) {
  // Your sync logic here
}
```

### 2. Customer Search Across Environments

```javascript
// Search in both environments
const environments = ['prod', 'staging'];
const results = [];

for (const env of environments) {
  const response = await $http.request({
    method: 'POST',
    url: `http://victoury-mcp-${env}:3000/tools/search_customers`,
    body: {
      arguments: {
        query: "john.doe@example.com"
      }
    }
  });
  
  results.push({
    environment: env,
    customers: response.result.data
  });
}

return results;
```

### 3. Booking Automation

```javascript
// 1. Search for available products
const products = await $http.request({
  method: 'POST',
  url: 'http://victoury-mcp-prod:3000/tools/list_products',
  body: {
    arguments: {
      category: 'tours',
      destination: 'Paris',
      startDate: '2024-06-01',
      endDate: '2024-06-30'
    }
  }
});

// 2. Check availability
const availability = await $http.request({
  method: 'POST',
  url: 'http://victoury-mcp-prod:3000/tools/list_availability',
  body: {
    arguments: {
      productId: products.result.data[0].id,
      startDate: '2024-06-15',
      endDate: '2024-06-15',
      participants: 2
    }
  }
});

// 3. Create booking if available
if (availability.result.data.length > 0) {
  const booking = await $http.request({
    method: 'POST',
    url: 'http://victoury-mcp-prod:3000/tools/create_booking',
    body: {
      arguments: {
        productId: products.result.data[0].id,
        customerId: $json.customerId,
        startDate: '2024-06-15',
        participants: 2,
        notes: 'Booked via n8n automation'
      }
    }
  });
}
```

## Security Best Practices

### 1. Add Authentication to HTTP Server

Update `src/http-server.ts`:

```typescript
// Add API key middleware
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (req.path === '/health') {
    return next();
  }
  
  if (!apiKey || apiKey !== process.env.HTTP_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  
  next();
});
```

### 2. Use n8n Credentials

Create custom credentials in n8n:

1. Go to Credentials
2. Create new "Header Auth" credential
3. Set header name: `X-API-Key`
4. Set header value: Your API key

### 3. Network Isolation

The Docker setup uses internal networks. Services communicate using container names, not exposed ports.

## Monitoring

### Check Service Health

```bash
# Check all services
docker-compose -f docker-compose.n8n.yml ps

# Check MCP server logs
docker logs victoury-mcp-prod -f

# Check n8n logs
docker logs n8n -f
```

### Health Endpoints

- n8n: http://localhost:5678/healthz
- MCP Prod: http://localhost:3001/health
- MCP Staging: http://localhost:3002/health

## Troubleshooting

### 1. Connection Refused

If n8n can't connect to MCP servers:

```bash
# Check if services are on same network
docker network inspect victoury-n8n-network

# Restart services
docker-compose -f docker-compose.n8n.yml restart
```

### 2. Authentication Issues

Check environment variables:
```bash
docker exec victoury-mcp-prod env | grep VICTOURY
```

### 3. Debugging Workflows

In n8n, use the "Execute Workflow" with "Save Execution" enabled to see all request/response data.

## Performance Tips

1. **Use Batch Endpoints**: Instead of multiple requests, use `/batch`
2. **Cache Results**: Use n8n's static data for caching
3. **Rate Limiting**: Add delays between requests if needed
4. **Connection Pooling**: The HTTP server reuses connections

## Next Steps

1. Create custom n8n nodes for better integration
2. Add webhook support for real-time updates
3. Implement caching layer
4. Add metrics collection