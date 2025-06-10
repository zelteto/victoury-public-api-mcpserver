#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { VictouryAPIClient } from './api-client.js';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Define available tools with their schemas
const TOOLS = [
  {
    name: 'list_products',
    description: 'List available tours and travel products',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', default: 10 },
        page: { type: 'number', default: 1 },
        category: { type: 'string' },
        destination: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' }
      }
    }
  },
  {
    name: 'search_customers',
    description: 'Search for customers by email, name, or phone',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        limit: { type: 'number', default: 10 }
      }
    }
  },
  {
    name: 'create_booking',
    description: 'Create a new booking',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        customerId: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        participants: { type: 'number' },
        notes: { type: 'string' }
      },
      required: ['productId', 'customerId', 'startDate', 'participants']
    }
  },
  {
    name: 'list_availability',
    description: 'Check product availability',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        participants: { type: 'number', default: 1 }
      },
      required: ['productId', 'startDate', 'endDate']
    }
  }
];

class VictouryMCPServer {
  private server: Server;
  private apiClient: VictouryAPIClient;

  constructor() {
    this.server = new Server(
      {
        name: 'victoury-api-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize API client with environment variables or defaults
    this.apiClient = new VictouryAPIClient({
      baseURL: process.env.VICTOURY_API_URL || 'https://api.victoury.com/v2',
      apiKey: process.env.VICTOURY_TENANT,
      apiSecret: process.env.VICTOURY_SESSION_ID,
      timeout: parseInt(process.env.VICTOURY_API_TIMEOUT || '30000'),
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // Handle list tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS,
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Handle dynamic credentials if provided
        if (args && typeof args === 'object' && 'credentials' in args) {
          const creds = args.credentials as any;
          this.apiClient = new VictouryAPIClient({
            baseURL: creds?.apiUrl || process.env.VICTOURY_API_URL || 'https://api.victoury.com/v2',
            apiKey: creds?.tenant || process.env.VICTOURY_TENANT,
            apiSecret: creds?.sessionId || process.env.VICTOURY_SESSION_ID,
            timeout: parseInt(process.env.VICTOURY_API_TIMEOUT || '30000'),
          });
        }

        // Remove credentials from args before passing to API
        const apiArgs = args ? { ...args } : {};
        if ('credentials' in apiArgs) {
          delete apiArgs.credentials;
        }

        let result;
        switch (name) {
          case 'list_products':
            result = await this.apiClient.listProducts(apiArgs as any);
            break;

          case 'search_customers':
            result = await this.apiClient.searchCustomers(apiArgs as any);
            break;

          case 'create_booking':
            result = await this.apiClient.createBooking(apiArgs as any);
            break;

          case 'list_availability':
            result = await this.apiClient.listAvailability(apiArgs as any);
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
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Victoury MCP Server started on STDIO');
  }
}

// Start the server
const server = new VictouryMCPServer();
server.start().catch(console.error);