# Victoury Public API MCP Server

An MCP (Model Context Protocol) server implementation for the Victoury Public API v2, enabling AI agents to interact with Victoury's travel management platform.

## Features

- 🔐 **Authentication**: Secure API key/secret authentication
- 📦 **Product Management**: List and retrieve tour/product details
- 👥 **Customer Search**: Find and manage customer information
- 📅 **Booking Operations**: Create, update, and retrieve bookings
- 🗓️ **Availability Checking**: Real-time availability queries
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