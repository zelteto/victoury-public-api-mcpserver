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
        productId: {
          type: 'string',
          description: 'Filter by product ID',
        },
        startDate: {
          type: 'string',
          description: 'Filter by start date (ISO 8601)',
        },
        endDate: {
          type: 'string',
          description: 'Filter by end date (ISO 8601)',
        },
        destination: {
          type: 'string',
          description: 'Filter by destination',
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
        notes: {
          type: 'string',
          description: 'Optional notes',
        },
      },
      required: ['dealId', 'customerId', 'participants'],
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

      // Service Monitoring
      case 'get_api_info': {
        const result = await apiClient.getApiInfo();
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
        const params = ViewDocumentParams.parse(args);
        const result = await apiClient.viewDocument(params.documentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'download_document': {
        const params = DownloadDocumentParams.parse(args);
        const result = await apiClient.downloadDocument(params.documentId, params.format);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
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