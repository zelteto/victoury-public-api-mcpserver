# n8n Integration Guide for Victoury MCP Server

## Overview

Since n8n doesn't natively support MCP servers, we provide several integration methods:

1. **HTTP API Wrapper** (Recommended)
2. **Custom n8n Node**
3. **Docker Compose Integration**
4. **Direct API Integration**

## Method 1: HTTP API Wrapper (Recommended)

### Setup

1. **Start the HTTP Server**:
```bash
# Using Docker
docker run -d \
  --name victoury-mcp-http \
  -p 3000:3000 \
  --env-file deployment/envs/production.env \
  victoury-mcp:http \
  npm run http-server

# Or directly
npm run http-server
```

2. **Use in n8n with HTTP Request Node**:

### n8n Workflow Examples

#### List Products
```json
{
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/tools/list_products",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "arguments",
              "value": "={{ JSON.stringify({ limit: 10, page: 1 }) }}"
            }
          ]
        }
      },
      "name": "List Products",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    }
  ]
}
```

#### Dynamic Credentials per Request
```json
{
  "parameters": {
    "method": "POST",
    "url": "http://localhost:3000/tools/list_products",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "credentials",
          "value": "={{ JSON.stringify({ apiUrl: $json.apiUrl, tenant: $json.tenant, sessionId: $json.sessionId }) }}"
        },
        {
          "name": "arguments",
          "value": "={{ JSON.stringify({ limit: 10 }) }}"
        }
      ]
    }
  }
}
```

## Method 2: Custom n8n Node

### Create Custom Victoury Node

Create `n8n-nodes-victoury/nodes/Victoury/Victoury.node.ts`:

```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import axios from 'axios';

export class Victoury implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Victoury',
    name: 'victoury',
    group: ['transform'],
    version: 1,
    description: 'Interact with Victoury API via MCP',
    defaults: {
      name: 'Victoury',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'victouryApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'List Products',
            value: 'listProducts',
          },
          {
            name: 'Create Booking',
            value: 'createBooking',
          },
          {
            name: 'Search Customers',
            value: 'searchCustomers',
          },
        ],
        default: 'listProducts',
      },
      // Add operation-specific parameters
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const operation = this.getNodeParameter('operation', 0) as string;
    const credentials = await this.getCredentials('victouryApi');
    
    const mcpUrl = credentials.mcpServerUrl || 'http://localhost:3000';
    
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
      try {
        const response = await axios.post(
          `${mcpUrl}/tools/${operation}`,
          {
            credentials: {
              apiUrl: credentials.apiUrl,
              tenant: credentials.tenant,
              sessionId: credentials.sessionId,
            },
            arguments: {
              // Get parameters based on operation
            },
          }
        );
        
        results.push({
          json: response.data.result,
        });
      } catch (error) {
        throw new Error(`Victoury API Error: ${error.message}`);
      }
    }
    
    return [results];
  }
}
```

## Method 3: Docker Compose Integration

### docker-compose.n8n.yml
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - victoury-network

  victoury-mcp-http:
    build:
      context: ..
      dockerfile: deployment/Dockerfile
    command: ["npm", "run", "http-server"]
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - ./envs/production.env
    environment:
      - HTTP_PORT=3000
    networks:
      - victoury-network

networks:
  victoury-network:
    driver: bridge

volumes:
  n8n_data:
```

## Method 4: Direct API Integration

Use n8n's HTTP Request node to call Victoury API directly:

### n8n Credentials
Create custom credentials in n8n:

```json
{
  "name": "Victoury API",
  "displayName": "Victoury API",
  "properties": [
    {
      "displayName": "API URL",
      "name": "apiUrl",
      "type": "string",
      "default": "https://api.victoury.com/v2"
    },
    {
      "displayName": "Tenant",
      "name": "tenant",
      "type": "string",
      "default": ""
    },
    {
      "displayName": "Session ID",
      "name": "sessionId",
      "type": "string",
      "typeOptions": {
        "password": true
      },
      "default": ""
    }
  ]
}
```

## n8n Workflow Templates

### 1. Product Search and Booking Flow
```json
{
  "name": "Victoury Product Search and Booking",
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://victoury-mcp-http:3000/tools/list_products",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "arguments",
              "value": "={{ JSON.stringify({ category: 'tours', limit: 20 }) }}"
            }
          ]
        }
      },
      "name": "Search Products",
      "type": "n8n-nodes-base.httpRequest",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://victoury-mcp-http:3000/tools/create_booking",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "arguments",
              "value": "={{ JSON.stringify({ productId: $json.products[0].id, customerId: '12345', startDate: '2024-06-01', participants: 2 }) }}"
            }
          ]
        }
      },
      "name": "Create Booking",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    }
  ]
}
```

### 2. Multi-Client Workflow
```json
{
  "name": "Multi-Client Victoury Operations",
  "nodes": [
    {
      "parameters": {
        "values": {
          "object": [
            {
              "clientName": "Client A",
              "apiUrl": "https://api.client-a.victoury.com/v2",
              "tenant": "{{ $env.CLIENT_A_TENANT }}",
              "sessionId": "{{ $env.CLIENT_A_SESSION }}"
            },
            {
              "clientName": "Client B",
              "apiUrl": "https://api.client-b.victoury.com/v2",
              "tenant": "{{ $env.CLIENT_B_TENANT }}",
              "sessionId": "{{ $env.CLIENT_B_SESSION }}"
            }
          ]
        }
      },
      "name": "Client Credentials",
      "type": "n8n-nodes-base.set",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://victoury-mcp-http:3000/tools/list_products",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "credentials",
              "value": "={{ JSON.stringify({ apiUrl: $json.apiUrl, tenant: $json.tenant, sessionId: $json.sessionId }) }}"
            },
            {
              "name": "arguments",
              "value": "={{ JSON.stringify({ limit: 5 }) }}"
            }
          ]
        }
      },
      "name": "Get Products per Client",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    }
  ]
}
```

## Security Considerations

1. **Environment Variables in n8n**:
   - Use n8n's built-in credential system
   - Never hardcode credentials in workflows

2. **Network Security**:
   - Use internal Docker networks
   - Don't expose MCP HTTP server publicly

3. **Authentication**:
   - Add API key authentication to HTTP server
   - Use n8n's credential system

## Example: Adding Authentication to HTTP Server

```typescript
// Add to http-server.ts
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.HTTP_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  
  next();
});
```

Then in n8n, add the API key to headers:
```json
{
  "parameters": {
    "headerParameters": {
      "parameters": [
        {
          "name": "X-API-Key",
          "value": "{{ $credentials.apiKey }}"
        }
      ]
    }
  }
}
```