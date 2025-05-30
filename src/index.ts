#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { VictouryAPIClient } from './api-client.js';
import { 
  ListProductsParams,
  GetProductDetailsParams,
  SearchCustomersParams,
  CreateBookingParams,
  GetBookingDetailsParams,
  UpdateBookingParams,
  ListAvailabilityParams,
  AuthenticateParams
} from './types.js';

// Load environment variables
dotenv.config();

// Initialize the API client
const apiClient = new VictouryAPIClient({
  baseURL: process.env.VICTOURY_API_URL || 'https://api.victoury.com/v2',
  apiKey: process.env.VICTOURY_API_KEY,
});

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'authenticate',
    description: 'Authenticate with the Victoury API using API credentials',
    inputSchema: {
      type: 'object',
      properties: {
        apiKey: {
          type: 'string',
          description: 'API key for authentication',
        },
        apiSecret: {
          type: 'string',
          description: 'API secret for authentication',
        },
      },
      required: ['apiKey', 'apiSecret'],
    },
  },
  {
    name: 'list_products',
    description: 'List available products/tours from the Victoury catalog',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Page number for pagination',
          default: 1,
        },
        limit: {
          type: 'number',
          description: 'Number of items per page',
          default: 20,
        },
        category: {
          type: 'string',
          description: 'Filter by product category',
        },
        destination: {
          type: 'string',
          description: 'Filter by destination',
        },
        startDate: {
          type: 'string',
          description: 'Filter by start date (ISO 8601)',
        },
        endDate: {
          type: 'string',
          description: 'Filter by end date (ISO 8601)',
        },
      },
    },
  },
  {
    name: 'get_product_details',
    description: 'Get detailed information about a specific product',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Unique identifier of the product',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'search_customers',
    description: 'Search for customers in the Victoury system',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (name, email, phone)',
        },
        email: {
          type: 'string',
          description: 'Filter by exact email address',
        },
        phone: {
          type: 'string',
          description: 'Filter by phone number',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
          default: 1,
        },
        limit: {
          type: 'number',
          description: 'Number of items per page',
          default: 20,
        },
      },
    },
  },
  {
    name: 'create_booking',
    description: 'Create a new booking for a product',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID to book',
        },
        customerId: {
          type: 'string',
          description: 'Customer ID making the booking',
        },
        startDate: {
          type: 'string',
          description: 'Start date of the booking (ISO 8601)',
        },
        endDate: {
          type: 'string',
          description: 'End date of the booking (ISO 8601)',
        },
        participants: {
          type: 'number',
          description: 'Number of participants',
        },
        notes: {
          type: 'string',
          description: 'Additional booking notes',
        },
      },
      required: ['productId', 'customerId', 'startDate', 'participants'],
    },
  },
  {
    name: 'get_booking_details',
    description: 'Get details of a specific booking',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: {
          type: 'string',
          description: 'Unique identifier of the booking',
        },
      },
      required: ['bookingId'],
    },
  },
  {
    name: 'update_booking',
    description: 'Update an existing booking',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: {
          type: 'string',
          description: 'Booking ID to update',
        },
        status: {
          type: 'string',
          description: 'New booking status',
          enum: ['confirmed', 'pending', 'cancelled'],
        },
        participants: {
          type: 'number',
          description: 'Updated number of participants',
        },
        notes: {
          type: 'string',
          description: 'Updated booking notes',
        },
      },
      required: ['bookingId'],
    },
  },
  {
    name: 'list_availability',
    description: 'Check availability for products within a date range',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID to check availability for',
        },
        startDate: {
          type: 'string',
          description: 'Start date for availability check (ISO 8601)',
        },
        endDate: {
          type: 'string',
          description: 'End date for availability check (ISO 8601)',
        },
        participants: {
          type: 'number',
          description: 'Number of participants to check availability for',
        },
      },
      required: ['productId', 'startDate', 'endDate'],
    },
  },
];

// Create the MCP server
const server = new Server(
  {
    name: 'victoury-api-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'authenticate': {
        const params = AuthenticateParams.parse(args);
        const result = await apiClient.authenticate(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_products': {
        const params = ListProductsParams.parse(args);
        const result = await apiClient.listProducts(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_product_details': {
        const params = GetProductDetailsParams.parse(args);
        const result = await apiClient.getProductDetails(params.productId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'search_customers': {
        const params = SearchCustomersParams.parse(args);
        const result = await apiClient.searchCustomers(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_booking': {
        const params = CreateBookingParams.parse(args);
        const result = await apiClient.createBooking(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_booking_details': {
        const params = GetBookingDetailsParams.parse(args);
        const result = await apiClient.getBookingDetails(params.bookingId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_booking': {
        const params = UpdateBookingParams.parse(args);
        const result = await apiClient.updateBooking(params.bookingId, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_availability': {
        const params = ListAvailabilityParams.parse(args);
        const result = await apiClient.listAvailability(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: `Invalid parameters: ${error.errors
              .map((e) => `${e.path.join('.')}: ${e.message}`)
              .join(', ')}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Victoury API MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});