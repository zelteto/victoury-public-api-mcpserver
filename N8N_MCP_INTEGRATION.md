# n8n MCP Integration Guide for Victoury API

## Overview

This guide explains how to integrate your Victoury MCP server with n8n using the latest MCP (Model Context Protocol) nodes. There are two approaches:

1. **Using n8n MCP Client Node** (Recommended for AI workflows)
2. **Using HTTP Request Node** (Direct API calls)

## Prerequisites

- n8n instance (local or cloud)
- Victoury MCP server running
- n8n community nodes enabled

## Method 1: Using n8n MCP Client Node

### Step 1: Install n8n MCP Nodes

```bash
# Install the MCP nodes in your n8n instance
npm install @nerding-io/n8n-nodes-mcp
# or
npm install @coleam00/n8n-nodes-mcp
```

### Step 2: Enable Community Nodes as Tools

For AI Agent workflows, enable community nodes:

```bash
# For local n8n
export N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
n8n start
```

For Docker:
```yaml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
      - MCP_VICTOURY_API_KEY=${VICTOURY_API_KEY}
      - MCP_VICTOURY_API_SECRET=${VICTOURY_API_SECRET}
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
```

### Step 3: Configure MCP Client Node

In your n8n workflow:

1. Add an **MCP Client** node
2. Configure the connection:
   - **Command**: `node`
   - **Arguments**: `["/path/to/victoury-mcp-server/dist/index.js"]`
   - **Environment Variables**:
     ```
     VICTOURY_API_URL=https://api.victoury.com/v2
     VICTOURY_TENANT=your-tenant
     VICTOURY_SESSION_ID=your-session-id
     ```

### Step 4: Use with AI Agent

```json
{
  "nodes": [
    {
      "name": "Chat Trigger",
      "type": "n8n-nodes-langchain.chatTrigger",
      "position": [250, 300]
    },
    {
      "name": "MCP Client - Victoury",
      "type": "@nerding-io/n8n-nodes-mcp.mcpClient",
      "position": [450, 400],
      "parameters": {
        "command": "node",
        "args": ["dist/index.js"],
        "env": {
          "VICTOURY_API_URL": "{{ $env.VICTOURY_API_URL }}",
          "VICTOURY_TENANT": "{{ $env.MCP_VICTOURY_API_KEY }}",
          "VICTOURY_SESSION_ID": "{{ $env.MCP_VICTOURY_API_SECRET }}"
        }
      }
    },
    {
      "name": "AI Agent",
      "type": "n8n-nodes-langchain.agent",
      "position": [650, 300],
      "parameters": {
        "tools": ["MCP Client - Victoury"]
      }
    }
  ]
}
```

## Method 2: Using HTTP MCP Server (Recommended)

### Step 1: Start HTTP MCP Server

Use the secure HTTP server version:

```bash
# Build the project
npm run build

# Start with authentication
HTTP_API_KEY=your-secure-key node dist/http-server-secure.js
```

### Step 2: Docker Compose Setup

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - victoury-network

  victoury-mcp:
    build:
      context: .
      dockerfile: deployment/Dockerfile
    container_name: victoury-mcp
    command: ["node", "dist/http-server-secure.js"]
    environment:
      - NODE_ENV=production
      - HTTP_PORT=3000
      - HTTP_API_KEY=${HTTP_API_KEY}
      - VICTOURY_API_URL=${VICTOURY_API_URL}
      - VICTOURY_TENANT=${VICTOURY_TENANT}
      - VICTOURY_SESSION_ID=${VICTOURY_SESSION_ID}
      - RATE_LIMIT_PER_MINUTE=100
    ports:
      - "3001:3000"
    networks:
      - victoury-network

networks:
  victoury-network:
    driver: bridge

volumes:
  n8n_data:
```

### Step 3: Create n8n Workflow

#### HTTP Request Node Configuration

```json
{
  "method": "POST",
  "url": "http://victoury-mcp:3000/tools/list_products",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "X-API-Key",
        "value": "={{ $credentials.apiKey }}"
      }
    ]
  },
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "arguments",
        "value": "={{ { limit: 10, category: 'tours' } }}"
      }
    ]
  }
}
```

## Advanced Workflows

### 1. AI-Powered Booking Assistant

```javascript
// In Code node
const prompt = `
I need to book a tour for {{customerName}} in {{destination}}.
Please:
1. Search for available tours
2. Check availability for {{dates}}
3. Create a booking option
4. Return booking details
`;

// Use with AI Agent connected to MCP tools
return { prompt };
```

### 2. Multi-Environment Product Sync

```javascript
// Check availability across environments
const environments = ['prod', 'staging'];
const results = [];

for (const env of environments) {
  const url = env === 'prod' 
    ? 'http://victoury-mcp-prod:3000' 
    : 'http://victoury-mcp-staging:3000';
    
  const response = await $http.request({
    method: 'POST',
    url: `${url}/tools/list_availability`,
    headers: { 'X-API-Key': $credentials.apiKey },
    body: {
      arguments: {
        productId: $json.productId,
        startDate: $json.startDate,
        endDate: $json.endDate,
        participants: 2
      }
    }
  });
  
  results.push({
    environment: env,
    availability: response.result
  });
}

return results;
```

### 3. Dynamic Credentials per Request

```javascript
// Use different credentials based on client
const client = $json.client;
const credentials = {
  'client-a': {
    url: 'https://api.client-a.victoury.com/v2',
    tenant: 'client-a-tenant',
    sessionId: 'client-a-session'
  },
  'client-b': {
    url: 'https://api.client-b.victoury.com/v2',
    tenant: 'client-b-tenant',
    sessionId: 'client-b-session'
  }
};

return await $http.request({
  method: 'POST',
  url: 'http://victoury-mcp:3000/tools/search_customers',
  headers: { 'X-API-Key': $credentials.httpApiKey },
  body: {
    arguments: { query: $json.customerEmail },
    credentials: credentials[client]
  }
});
```

## MCP Trigger Node Setup

For chat-based workflows using the MCP Server Trigger:

```json
{
  "mcpServers": {
    "victoury": {
      "command": "node",
      "args": [
        "/app/dist/index.js"
      ],
      "env": {
        "VICTOURY_API_URL": "${VICTOURY_API_URL}",
        "VICTOURY_TENANT": "${VICTOURY_TENANT}",
        "VICTOURY_SESSION_ID": "${VICTOURY_SESSION_ID}"
      }
    }
  }
}
```

## Best Practices

### 1. Security
- Always use `HTTP_API_KEY` in production
- Store credentials in n8n's credential manager
- Use environment variables for sensitive data

### 2. Performance
- Use batch endpoints for multiple operations
- Implement caching for frequently accessed data
- Set appropriate rate limits

### 3. Error Handling
```javascript
try {
  const result = await $http.request({
    method: 'POST',
    url: 'http://victoury-mcp:3000/tools/create_booking',
    // ... configuration
  });
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result;
} catch (error) {
  // Log error and return fallback
  console.error('Booking failed:', error);
  return { 
    success: false, 
    error: error.message,
    fallback: true 
  };
}
```

## Troubleshooting

### Connection Issues
```bash
# Check if MCP server is running
curl http://localhost:3001/health

# Check logs
docker logs victoury-mcp -f

# Test with authentication
curl -X POST http://localhost:3001/tools/list_products \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"limit": 5}}'
```

### n8n Integration Issues
1. Ensure community nodes are enabled
2. Check network connectivity between containers
3. Verify environment variables are set
4. Review n8n execution logs

## Next Steps

1. Create custom n8n nodes for specific Victoury operations
2. Implement webhook support for real-time updates
3. Add caching layer with Redis
4. Create pre-built workflow templates
5. Set up monitoring and alerting

## Resources

- [n8n MCP Nodes Documentation](https://github.com/nerding-io/n8n-nodes-mcp)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [n8n AI Features](https://docs.n8n.io/advanced-ai/)
- [Victoury API Documentation](./reference/victoury-api-reference.md)