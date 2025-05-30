# Victoury Public API MCP Server

A comprehensive MCP (Model Context Protocol) server implementation for the Victoury Public API v2, providing full access to Victoury's travel management platform. This server enables AI agents to perform a wide range of operations including product management, deal workflows, customer management, booking operations, document handling, pricing queries, and payment processing.

## Features

### Core Operations
- 🔐 **Authentication**: Secure API key/secret authentication
- 📊 **Service Monitoring**: API health checks and system information
- 📦 **Product Management**: List products, retrieve details, starting dates, and pricing
- 👥 **Customer Operations**: Search customers, update person and address information
- 📅 **Booking System**: Create, update, and retrieve bookings
- 🗓️ **Availability Checking**: Real-time availability queries with package pricing

### Advanced Features
- 🎫 **Deal Management**: Search deals, create options, convert to bookings
- 📄 **Document Handling**: View and download invoices, tickets, vouchers, contracts
- 💰 **Quote System**: Initialize quotes with custom pricing components
- 💳 **Payment Processing**: Register customer payments with transaction tracking
- 🛡️ **Type Safety**: Full TypeScript support with Zod validation
- ⚡ **Error Handling**: Comprehensive error management

## Installation

### Using npm/yarn

```bash
npm install victoury-public-api-mcpserver
# or
yarn add victoury-public-api-mcpserver
```

### From Source

```bash
git clone https://github.com/yourusername/victoury-public-api-mcpserver.git
cd victoury-public-api-mcpserver
npm install
npm run build
```

## Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your Victoury API credentials:
```env
VICTOURY_API_URL=https://api.victoury.com/v2
VICTOURY_API_KEY=your_api_key_here
VICTOURY_API_SECRET=your_api_secret_here
VICTOURY_API_TIMEOUT=30000
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "victoury-api": {
      "command": "node",
      "args": ["/path/to/victoury-public-api-mcpserver/dist/index.js"],
      "env": {
        "VICTOURY_API_KEY": "your_api_key",
        "VICTOURY_API_SECRET": "your_api_secret"
      }
    }
  }
}
```

### With MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Available Tools

### authenticate
Authenticate with the Victoury API using API credentials.

```typescript
{
  apiKey: string;
  apiSecret: string;
}
```

### list_products
List available products/tours with optional filters.

```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 20
  category?: string;
  destination?: string;
  startDate?: string;     // ISO 8601
  endDate?: string;       // ISO 8601
}
```

### get_product_details
Get detailed information about a specific product.

```typescript
{
  productId: string;
}
```

### search_customers
Search for customers by various criteria.

```typescript
{
  query?: string;         // General search
  email?: string;
  phone?: string;
  page?: number;          // Default: 1
  limit?: number;         // Default: 20
}
```

### create_booking
Create a new booking for a product.

```typescript
{
  productId: string;
  customerId: string;
  startDate: string;      // ISO 8601
  endDate?: string;       // ISO 8601
  participants: number;
  notes?: string;
}
```

### get_booking_details
Retrieve details of a specific booking.

```typescript
{
  bookingId: string;
}
```

### update_booking
Update an existing booking.

```typescript
{
  bookingId: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  participants?: number;
  notes?: string;
}
```

### list_availability
Check availability for products within a date range.

```typescript
{
  productId: string;
  startDate: string;      // ISO 8601
  endDate: string;        // ISO 8601
  participants?: number;
}
```

### get_api_info
Retrieve API version and environment information.

No parameters required.

### get_api_health
Check API health status and service availability.

No parameters required.

### get_deal_details
Retrieve details of a specific deal.

```typescript
{
  dealId: string;
}
```

### update_deal
Update deal information.

```typescript
{
  dealId: string;
  status?: string;
  notes?: string;
}
```

### search_publish_deals
Search for published deals with filters.

```typescript
{
  productId?: string;
  startDate?: string;     // ISO 8601
  endDate?: string;       // ISO 8601
  destination?: string;
  page?: number;
  limit?: number;
}
```

### create_option_booking
Create an option/hold on a deal before final booking.

```typescript
{
  dealId: string;
  customerId: string;
  participants: number;
  notes?: string;
}
```

### option_to_booking
Convert an option/hold into a confirmed booking.

```typescript
{
  optionId: string;
  paymentMethod?: string;
}
```

### view_document
View document details (invoice, ticket, voucher, contract).

```typescript
{
  documentId: string;
}
```

### download_document
Download a document in specified format.

```typescript
{
  documentId: string;
  format?: 'pdf' | 'html';  // default: 'pdf'
}
```

### get_product_starting_dates
Retrieve available starting dates for a product.

```typescript
{
  productId: string;
  startDate?: string;     // ISO 8601
  endDate?: string;       // ISO 8601
}
```

### get_product_starting_date_prices
Get pricing for specific product starting date.

```typescript
{
  productId: string;
  startingDate: string;   // ISO 8601
  participants?: number;
}
```

### get_package_price_availability
Check package pricing and availability.

```typescript
{
  productId: string;
  packageId: string;
  startDate: string;      // ISO 8601
  participants: number;
}
```

### update_person
Update person/traveler information.

```typescript
{
  personId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;   // ISO 8601
}
```

### update_address
Update address information.

```typescript
{
  addressId: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
```

### initialize_quote
Initialize a new quote with pricing components.

```typescript
{
  productId: string;
  startDate: string;      // ISO 8601
  participants: number;
  priceComponents?: Array<{
    type: string;
    amount: number;
  }>;
}
```

### register_customer_payment
Register a customer payment for a booking.

```typescript
{
  bookingId: string;
  amount: number;
  currency: string;       // e.g., 'EUR', 'USD'
  paymentMethod: string;
  transactionId?: string;
}
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── index.ts          # MCP server setup and tool handlers
├── api-client.ts     # Victoury API client implementation
└── types.ts          # TypeScript types and Zod schemas
```

## API Response Format

All API responses follow this structure:

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Handling

The server handles various error types:

- **Validation Errors**: Invalid input parameters
- **Authentication Errors**: Invalid or expired credentials
- **API Errors**: Upstream API issues
- **Network Errors**: Connection problems
- **Timeout Errors**: Request timeouts

All errors are returned in MCP-compliant format with detailed messages.

## Security

- API credentials are never logged or exposed
- All inputs are validated using Zod schemas
- HTTPS connections are enforced
- Authentication tokens are stored in memory only

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- Create an issue on GitHub
- Contact Victoury support for API-specific questions
- Check the [MCP documentation](https://modelcontextprotocol.io) for protocol details