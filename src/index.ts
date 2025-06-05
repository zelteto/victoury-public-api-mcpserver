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
import fs from 'fs';
import path from 'path';
import { VictouryAPIClient } from './api-client.js';
import { 
  ListProductsParams,
  GetProductDetailsParams,
  SearchCustomersParams,
  CreateBookingParams,
  GetBookingDetailsParams,
  UpdateBookingParams,
  ListAvailabilityParams,
  AuthenticateParams,
  GetApiInfoParams,
  GetApiHealthParams,
  GetDealDetailsParams,
  UpdateDealParams,
  SearchPublishDealsParams,
  CreateOptionBookingParams,
  OptionToBookingParams,
  ViewDocumentParams,
  DownloadDocumentParams,
  GetProductStartingDatesParams,
  GetProductStartingDatePricesParams,
  GetPackagePriceAvailabilityParams,
  UpdatePersonParams,
  UpdateAddressParams,
  InitializeQuoteParams,
  RegisterCustomerPaymentParams
} from './types.js';

// Load environment variables
dotenv.config();

// Create a simple file logger
const logFile = path.join(process.cwd(), 'victoury-mcp-debug.log');
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.error(message);
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (e) {
    // Ignore file write errors
  }
};

// Debug: Log configuration
log('\n=== Victoury API MCP Server Configuration ===');
log(`API URL: ${process.env.VICTOURY_API_URL || 'https://api.victoury.com/v2'}`);
log(`API Key: ${process.env.VICTOURY_API_KEY ? '[SET]' : '[NOT SET]'}`);
log(`API Secret: ${process.env.VICTOURY_API_SECRET ? '[SET]' : '[NOT SET]'}`);
log(`Timeout: ${process.env.VICTOURY_API_TIMEOUT || '30000'}ms`);
log(`Log file: ${logFile}`);
log('==========================================\n');

// Initialize the API client
const apiClient = new VictouryAPIClient({
  baseURL: process.env.VICTOURY_API_URL || 'https://api.victoury.com/v2',
  apiKey: process.env.VICTOURY_API_KEY,
  apiSecret: process.env.VICTOURY_API_SECRET,
});

// Define available tools
const TOOLS: Tool[] = [
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
  // Service Monitoring Tools
  {
    name: 'get_api_info',
    description: 'Retrieve API version and environment information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_api_health',
    description: 'Check API health status and service availability',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  // Deal Management Tools
  {
    name: 'get_deal_details',
    description: 'Retrieve details of a specific deal',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: {
          type: 'string',
          description: 'Unique identifier of the deal',
        },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'update_deal',
    description: 'Update deal information',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: {
          type: 'string',
          description: 'Unique identifier of the deal',
        },
        status: {
          type: 'string',
          description: 'New status for the deal',
        },
        notes: {
          type: 'string',
          description: 'Additional notes or comments',
        },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'search_publish_deals',
    description: 'Search for published deals with filters',
    inputSchema: {
      type: 'object',
      properties: {
        operator: {
          type: 'string',
          enum: ['AND', 'OR'],
          description: 'Search operator (default: AND)',
        },
        criterias: {
          type: 'array',
          description: 'Array of search criteria',
          items: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                description: 'Field to search (e.g., id, uuid, destination, startDate)',
              },
              value: {
                type: 'string',
                description: 'Value to search for',
              },
              qualifier: {
                type: 'string',
                enum: ['=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'NOT IN'],
                description: 'Comparison operator (default: =)',
              },
            },
            required: ['field', 'value'],
          },
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
        },
        limit: {
          type: 'number',
          description: 'Number of results per page',
        },
      },
    },
  },
  {
    name: 'create_option_booking',
    description: 'Create an option/hold on a deal before final booking',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['O', 'B'],
          description: 'Action type: O for option, B for booking',
        },
        dealId: {
          type: 'string',
          description: 'Deal to create option for',
        },
        customerId: {
          type: 'string',
          description: 'Customer ID',
        },
        participants: {
          type: 'number',
          description: 'Number of participants',
        },
        currency: {
          type: 'string',
          description: 'Currency code',
        },
        arrangementType: {
          type: 'string',
          description: 'Type of arrangement',
        },
        language: {
          type: 'string',
          description: 'The code of deal language',
        },
        profitCenter: {
          type: 'string',
          description: 'Code of deal brand',
        },
        notes: {
          type: 'string',
          description: 'Optional notes',
        },
      },
      required: ['action', 'dealId', 'customerId', 'participants', 'profitCenter'],
    },
  },
  {
    name: 'option_to_booking',
    description: 'Convert an option/hold into a confirmed booking',
    inputSchema: {
      type: 'object',
      properties: {
        optionId: {
          type: 'string',
          description: 'Option ID to convert',
        },
        paymentMethod: {
          type: 'string',
          description: 'Payment method to use',
        },
      },
      required: ['optionId'],
    },
  },
  // Document Management Tools
  {
    name: 'view_document',
    description: 'View document details (invoice, ticket, voucher, contract)',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'Document ID to view',
        },
      },
      required: ['documentId'],
    },
  },
  {
    name: 'download_document',
    description: 'Download a document in specified format',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'Document ID to download',
        },
        format: {
          type: 'string',
          enum: ['pdf', 'html'],
          description: 'Download format (default: pdf)',
        },
      },
      required: ['documentId'],
    },
  },
  // Advanced Product Tools
  {
    name: 'get_product_starting_dates',
    description: 'Retrieve available starting dates for a product',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID',
        },
        startDate: {
          type: 'string',
          description: 'Filter from date (ISO 8601)',
        },
        endDate: {
          type: 'string',
          description: 'Filter to date (ISO 8601)',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'get_product_starting_date_prices',
    description: 'Get pricing for specific product starting date',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID',
        },
        startingDate: {
          type: 'string',
          description: 'Starting date to check prices for (ISO 8601)',
        },
        participants: {
          type: 'number',
          description: 'Number of participants for pricing',
        },
      },
      required: ['productId', 'startingDate'],
    },
  },
  {
    name: 'get_package_price_availability',
    description: 'Check package pricing and availability',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID',
        },
        packageId: {
          type: 'string',
          description: 'Package ID',
        },
        startDate: {
          type: 'string',
          description: 'Start date (ISO 8601)',
        },
        participants: {
          type: 'number',
          description: 'Number of participants',
        },
      },
      required: ['productId', 'packageId', 'startDate', 'participants'],
    },
  },
  // Person Management Tools
  {
    name: 'update_person',
    description: 'Update person/traveler information',
    inputSchema: {
      type: 'object',
      properties: {
        personId: {
          type: 'string',
          description: 'Person ID to update',
        },
        firstName: {
          type: 'string',
          description: 'First name',
        },
        lastName: {
          type: 'string',
          description: 'Last name',
        },
        email: {
          type: 'string',
          description: 'Email address',
        },
        phone: {
          type: 'string',
          description: 'Phone number',
        },
        dateOfBirth: {
          type: 'string',
          description: 'Date of birth (ISO 8601)',
        },
      },
      required: ['personId'],
    },
  },
  // Address Management Tools
  {
    name: 'update_address',
    description: 'Update address information',
    inputSchema: {
      type: 'object',
      properties: {
        addressId: {
          type: 'string',
          description: 'Address ID to update',
        },
        street: {
          type: 'string',
          description: 'Street address',
        },
        city: {
          type: 'string',
          description: 'City',
        },
        state: {
          type: 'string',
          description: 'State/Province',
        },
        country: {
          type: 'string',
          description: 'Country',
        },
        postalCode: {
          type: 'string',
          description: 'Postal/ZIP code',
        },
      },
      required: ['addressId'],
    },
  },
  // Quote Management Tools
  {
    name: 'initialize_quote',
    description: 'Initialize a new quote with pricing components',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID for the quote',
        },
        startDate: {
          type: 'string',
          description: 'Start date (ISO 8601)',
        },
        participants: {
          type: 'number',
          description: 'Number of participants',
        },
        priceComponents: {
          type: 'array',
          description: 'Optional custom price components',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Component type',
              },
              amount: {
                type: 'number',
                description: 'Amount',
              },
            },
          },
        },
      },
      required: ['productId', 'startDate', 'participants'],
    },
  },
  // Customer Payment Tools
  {
    name: 'register_customer_payment',
    description: 'Register a customer payment for a booking',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: {
          type: 'string',
          description: 'Booking ID',
        },
        amount: {
          type: 'number',
          description: 'Payment amount',
        },
        currency: {
          type: 'string',
          description: 'Currency code (e.g., EUR, USD)',
        },
        paymentMethod: {
          type: 'string',
          description: 'Payment method used',
        },
        transactionId: {
          type: 'string',
          description: 'Optional external transaction ID',
        },
      },
      required: ['bookingId', 'amount', 'currency', 'paymentMethod'],
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

  log(`\n=== MCP Tool Request ===`);
  log(`Tool: ${name}`);
  log(`Arguments: ${JSON.stringify(args, null, 2)}`);
  log(`Timestamp: ${new Date().toISOString()}`);

  try {
    switch (name) {

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

      // Service Monitoring
      case 'get_api_info': {
        log(`Calling apiClient.getApiInfo()`);
        const result = await apiClient.getApiInfo();
        log(`API Info Response: ${JSON.stringify(result, null, 2)}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_api_health': {
        const result = await apiClient.getApiHealth();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Deal Management
      case 'get_deal_details': {
        const params = GetDealDetailsParams.parse(args);
        const result = await apiClient.getDealDetails(params.dealId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_deal': {
        const params = UpdateDealParams.parse(args);
        const { dealId, ...updateData } = params;
        const result = await apiClient.updateDeal(dealId, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'search_publish_deals': {
        const params = SearchPublishDealsParams.parse(args);
        const result = await apiClient.searchPublishDeals(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_option_booking': {
        const params = CreateOptionBookingParams.parse(args);
        const result = await apiClient.createOptionBooking(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'option_to_booking': {
        const params = OptionToBookingParams.parse(args);
        const { optionId, ...conversionData } = params;
        const result = await apiClient.optionToBooking(optionId, conversionData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Document Management
      case 'view_document': {
        log(`\n--- Processing view_document tool ---`);
        log(`Raw arguments: ${JSON.stringify(args)}`);
        
        try {
          const params = ViewDocumentParams.parse(args);
          log(`Parsed params: ${JSON.stringify(params)}`);
          log(`Calling apiClient.viewDocument with ID: ${params.documentId}`);
          
          const result = await apiClient.viewDocument(params.documentId);
          log(`API call successful, result: ${JSON.stringify(result)}`);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (toolError) {
          log(`\n--- view_document tool error ---`);
          log(`Error in tool handler: ${toolError}`);
          log(`Error type: ${toolError?.constructor?.name}`);
          log(`Error message: ${toolError instanceof Error ? toolError.message : String(toolError)}`);
          log(`Error stack: ${toolError instanceof Error ? toolError.stack : 'No stack'}`);
          throw toolError;
        }
      }

      case 'download_document': {
        log(`\n--- Processing download_document tool ---`);
        log(`Raw arguments: ${JSON.stringify(args)}`);
        
        try {
          const params = DownloadDocumentParams.parse(args);
          log(`Parsed params: ${JSON.stringify(params)}`);
          log(`Calling apiClient.downloadDocument with ID: ${params.documentId}, format: ${params.format}`);
          
          const result = await apiClient.downloadDocument(params.documentId, params.format);
          log(`API call successful, result: ${JSON.stringify(result)}`);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (toolError) {
          log(`\n--- download_document tool error ---`);
          log(`Error in tool handler: ${toolError}`);
          log(`Error type: ${toolError?.constructor?.name}`);
          log(`Error message: ${toolError instanceof Error ? toolError.message : String(toolError)}`);
          throw toolError;
        }
      }

      // Advanced Product Management
      case 'get_product_starting_dates': {
        const params = GetProductStartingDatesParams.parse(args);
        const { productId, ...filterData } = params;
        const result = await apiClient.getProductStartingDates(productId, filterData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_product_starting_date_prices': {
        const params = GetProductStartingDatePricesParams.parse(args);
        const { productId, ...priceData } = params;
        const result = await apiClient.getProductStartingDatePrices(productId, priceData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_package_price_availability': {
        const params = GetPackagePriceAvailabilityParams.parse(args);
        const { productId, packageId, ...availabilityData } = params;
        const result = await apiClient.getPackagePriceAvailability(productId, packageId, availabilityData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Person Management
      case 'update_person': {
        const params = UpdatePersonParams.parse(args);
        const { personId, ...updateData } = params;
        const result = await apiClient.updatePerson(personId, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Address Management
      case 'update_address': {
        const params = UpdateAddressParams.parse(args);
        const { addressId, ...updateData } = params;
        const result = await apiClient.updateAddress(addressId, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Quote Management
      case 'initialize_quote': {
        const params = InitializeQuoteParams.parse(args);
        const result = await apiClient.initializeQuote(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Customer Payments
      case 'register_customer_payment': {
        const params = RegisterCustomerPaymentParams.parse(args);
        const result = await apiClient.registerCustomerPayment(params);
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
    log(`\n=== MCP Tool Error ===`);
    log(`Tool: ${name}`);
    log(`Arguments: ${JSON.stringify(args, null, 2)}`);
    log(`Error Type: ${error?.constructor?.name}`);
    log(`Error Message: ${error instanceof Error ? error.message : error}`);
    log(`Error Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
    
    // Try to extract more error details
    if (error instanceof Error && error.message.includes('API Error')) {
      log(`\n=== API Error Details ===`);
      const match = error.message.match(/API Error \((\d+)\): (.+)/);
      if (match) {
        log(`HTTP Status Code: ${match[1]}`);
        log(`Error Response: ${match[2]}`);
      }
    }
    
    // Check for enhanced error details from axios interceptor
    if (error && typeof error === 'object') {
      const enhancedError = error as any;
      
      if (enhancedError.requestDetails) {
        log(`\n=== Request Details That Caused Error ===`);
        log(`Timestamp: ${enhancedError.requestDetails.timestamp}`);
        log(`Method: ${enhancedError.requestDetails.method}`);
        log(`Full URL: ${enhancedError.requestDetails.fullURL}`);
        log(`Headers: ${JSON.stringify(enhancedError.requestDetails.headers, null, 2)}`);
        log(`Query Params: ${JSON.stringify(enhancedError.requestDetails.params, null, 2)}`);
        log(`Request Body: ${JSON.stringify(enhancedError.requestDetails.data, null, 2)}`);
      }
      
      if (enhancedError.originalError) {
        log(`\n=== Original Axios Error ===`);
        const axiosError = enhancedError.originalError;
        if (axiosError.response) {
          log(`Response Status: ${axiosError.response.status}`);
          log(`Response Data: ${JSON.stringify(axiosError.response.data, null, 2)}`);
        }
        if (axiosError.config) {
          log(`Failed URL: ${axiosError.config.baseURL}${axiosError.config.url}`);
        }
      }
    }
    
    // Log the raw error object with all properties
    log(`\n=== Raw Error Object ===`);
    const errorObj: any = {};
    if (error instanceof Error) {
      errorObj.name = error.name;
      errorObj.message = error.message;
      errorObj.stack = error.stack;
      // Get all properties
      Object.getOwnPropertyNames(error).forEach(key => {
        errorObj[key] = (error as any)[key];
      });
    }
    log(`Full Error Details: ${JSON.stringify(errorObj, (key, value) => {
      // Prevent circular reference issues
      if (key === 'originalError' || key === 'config' || key === 'request' || key === 'response') {
        return '[Already logged above]';
      }
      return value;
    }, 2)}`);
    
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
  log('Victoury API MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});