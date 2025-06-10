#!/usr/bin/env node
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { VictouryAPIClient } from './api-client.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS middleware for n8n
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'victoury-mcp-sse-server',
    protocol: 'MCP over SSE',
    timestamp: new Date().toISOString() 
  });
});

// MCP SSE endpoint
app.get('/mcp', async (req, res) => {
  console.error('New MCP SSE connection established');
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Create MCP server instance for this connection
  const server = new Server(
    {
      name: 'victoury-api-mcp-sse',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Initialize API client
  let apiClient = new VictouryAPIClient({
    baseURL: process.env.VICTOURY_API_URL || 'https://api.victoury.com/v2',
    apiKey: process.env.VICTOURY_TENANT,
    apiSecret: process.env.VICTOURY_SESSION_ID,
    timeout: parseInt(process.env.VICTOURY_API_TIMEOUT || '30000'),
  });

  // Define tools
  const TOOLS = [
    {
      name: 'list_products',
      description: 'List available tours and travel products',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of products to return', default: 10 },
          page: { type: 'number', description: 'Page number', default: 1 },
          category: { type: 'string', description: 'Filter by category' },
          destination: { type: 'string', description: 'Filter by destination' },
          startDate: { type: 'string', description: 'Filter by start date' },
          endDate: { type: 'string', description: 'Filter by end date' }
        }
      }
    },
    {
      name: 'search_customers',
      description: 'Search for customers',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          email: { type: 'string', description: 'Search by email' },
          phone: { type: 'string', description: 'Search by phone' },
          limit: { type: 'number', default: 10 }
        }
      }
    },
    {
      name: 'check_availability',
      description: 'Check product availability',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product ID' },
          startDate: { type: 'string', description: 'Start date' },
          endDate: { type: 'string', description: 'End date' },
          participants: { type: 'number', description: 'Number of participants', default: 1 }
        },
        required: ['productId', 'startDate', 'endDate']
      }
    }
  ];

  // Handle list tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      // Handle dynamic credentials
      if (args && typeof args === 'object' && 'credentials' in args) {
        const creds = args.credentials as any;
        apiClient = new VictouryAPIClient({
          baseURL: creds?.apiUrl || process.env.VICTOURY_API_URL || 'https://api.victoury.com/v2',
          apiKey: creds?.tenant || process.env.VICTOURY_TENANT,
          apiSecret: creds?.sessionId || process.env.VICTOURY_SESSION_ID,
          timeout: parseInt(process.env.VICTOURY_API_TIMEOUT || '30000'),
        });
      }

      const apiArgs = args ? { ...args } : {};
      if ('credentials' in apiArgs) {
        delete apiArgs.credentials;
      }
      let result;

      switch (name) {
        case 'list_products':
          result = await apiClient.listProducts(apiArgs as any);
          break;
        case 'search_customers':
          result = await apiClient.searchCustomers(apiArgs as any);
          break;
        case 'check_availability':
          result = await apiClient.listAvailability(apiArgs as any);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
        isError: true,
      };
    }
  });

  // Create SSE transport
  const transport = new SSEServerTransport('/mcp', res);
  await server.connect(transport);

  // Handle client disconnect
  req.on('close', () => {
    console.error('MCP SSE connection closed');
    server.close().catch(console.error);
  });
});

const PORT = process.env.MCP_PORT || 3001;
app.listen(PORT, () => {
  console.log(`
🚀 Victoury MCP SSE Server
=========================
Port: ${PORT}
Health: http://localhost:${PORT}/health
MCP Endpoint: http://localhost:${PORT}/mcp

For n8n MCP Client:
- Transport: HTTP (SSE)
- URL: http://victoury-mcp-sse:${PORT}/mcp
  `);
});