import { FastMCP } from "fastmcp";
import { z } from "zod";
import { VictouryCredentials, ApiInfoResponse, ApiHealthResponse } from './types.js';
import { makeVictouryRequest } from './utils/api-client.js';

// Initialize FastMCP server
const server = new FastMCP({
  name: "Victoury Public API v2",
  version: "1.0.0",
  instructions: `
    MCP server for Victoury Public API v2 - Comprehensive Travel Management Platform
    
    🔑 IMPORTANT: All tools require credentials to be passed with EVERY call:
    - url: API base URL (e.g., https://api.victoury.com/v2)
    - tenant: Your tenant identifier
    - sessionId: Your session ID for authentication
    
    📍 Base URLs:
    - Production: https://api.victoury.com/v2
    - Testing: https://api.acceptation-victoury.net/v2
    
    📋 Available Categories:
    
    1. SERVICE MONITORING (No versioning - uses /info and /health):
       - get_api_info: Retrieve API version and environment information
       - get_api_health: Check API health status and service availability
    
    2. DEAL MANAGEMENT:
       - get_deal_details: Retrieve comprehensive deal information by UUID
       - update_deal: Update deal fields (custom fields, addresses, etc.)
       - search_deals: Search deals with flexible criteria and pagination
       - create_option_booking: Create option (hold) or booking for products
    
    🔒 Authentication:
    Every API call requires valid credentials. The server uses:
    - Tenant header: Your tenant code
    - Session-Id header: Your API key
    
    📝 Error Handling:
    - 2xx: Success
    - 4xx: Client errors (invalid credentials, not found, validation errors)
    - 5xx: Server errors
    
    💡 Usage Example:
    All tools follow the pattern of requiring credentials as the last parameter:
    
    {
      "dealUuid": "62454f5113424008888b1c2c",
      "credentials": {
        "url": "https://api.acceptation-victoury.net/v2",
        "tenant": "my-tenant",
        "sessionId": "my-session-id"
      }
    }
    
    🚀 Multi-tenant Support:
    This server supports multiple tenants and environments. Simply pass different
    credentials for each call to switch between tenants or environments seamlessly.
  `
});

// Service Monitoring Tools
server.addTool({
  name: "get_api_info",
  description: "Retrieve API version and environment information from Victoury API. This endpoint is outside of API versioning - it uses /info instead of /v2/info.",
  parameters: z.object({
    credentials: VictouryCredentials
  }),
  execute: async (args) => {
    const response = await makeVictouryRequest(args.credentials, {
      method: 'GET',
      endpoint: '/info',
      useVersioning: false
    });
    
    // Validate response structure
    const validatedResponse = ApiInfoResponse.parse(response);
    
    // Return in proper MCP content format
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(validatedResponse, null, 2)
      }]
    };
  },
});

server.addTool({
  name: "get_api_health",
  description: "Check API health status and service availability. This endpoint is outside of API versioning - it uses /health instead of /v2/health.",
  parameters: z.object({
    credentials: VictouryCredentials
  }),
  execute: async (args) => {
    const response = await makeVictouryRequest(args.credentials, {
      method: 'GET',
      endpoint: '/health',
      useVersioning: false
    });
    
    // Return in proper MCP content format
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(response, null, 2)
      }]
    };
  },
});

// Deal Management Tools
server.addTool({
  name: "get_deal_details",
  description: "Retrieve detailed information about a specific deal by UUID. Returns comprehensive deal details including customer info, traveler details, arrangements, custom fields, and person-customer addresses.",
  parameters: z.object({
    dealUuid: z.string().min(1),
    credentials: VictouryCredentials
  }),
  execute: async (args) => {
    const response = await makeVictouryRequest(args.credentials, {
      method: 'GET',
      endpoint: `/deals/${args.dealUuid}.json`
    });
    
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(response, null, 2)
      }]
    };
  },
});

server.addTool({
  name: "update_deal",
  description: "Update an existing deal with new information. Only the fields provided in updateData will be modified; other fields remain unchanged. Supports updating custom field values and person-customer addresses.",
  parameters: z.object({
    dealId: z.string().min(1),
    updateData: z.record(z.any()),
    credentials: VictouryCredentials
  }),
  execute: async (args) => {
    const response = await makeVictouryRequest(args.credentials, {
      method: 'PATCH',
      endpoint: `/deals/${args.dealId}.json`,
      data: args.updateData
    });
    
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(response, null, 2)
      }]
    };
  },
});

server.addTool({
  name: "search_deals",
  description: "Search for published deals using various criteria. Supports searching by multiple fields including ID, UUID, dates, and status. Results are paginated with a default limit of 100 items.",
  parameters: z.object({
    searchRequest: z.object({
      operator: z.string(),
      criterias: z.array(z.object({
        field: z.string(),
        value: z.string(),
        qualifier: z.string()
      })),
      count: z.number().optional(),
      page: z.number().optional(),
      sort: z.string().optional()
    }),
    credentials: VictouryCredentials
  }),
  execute: async (args) => {
    const response = await makeVictouryRequest(args.credentials, {
      method: 'POST',
      endpoint: '/deals/search.json',
      data: args.searchRequest
    });
    
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(response, null, 2)
      }]
    };
  },
});

server.addTool({
  name: "create_option_booking",
  description: "Create a new option (hold) or booking for a product. An option allows temporarily reserving a product before final confirmation. When created, an entry is automatically added to Customer Payments.",
  parameters: z.object({
    bookingData: z.object({
      type: z.enum(['O', 'B']).describe('"O" for Option, "B" for Booking'),
      productId: z.string().min(1),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
      numberOfTravelers: z.number().min(1),
      mainTraveler: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email()
      }),
      optionExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      notes: z.string().optional()
    }),
    credentials: VictouryCredentials
  }),
  execute: async (args) => {
    const response = await makeVictouryRequest(args.credentials, {
      method: 'POST',
      endpoint: '/deals/createoptionbooking.json',
      data: args.bookingData
    });
    
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(response, null, 2)
      }]
    };
  },
});

// Start the server
server.start({
  transportType: "stdio",
});

export default server;