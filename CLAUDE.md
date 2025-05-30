# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the Victoury Public API MCP Server.

## Project Overview

This is an MCP (Model Context Protocol) server implementation for the Victoury Public API v2. The server provides a standardized interface for AI agents to interact with Victoury's travel management platform, enabling operations such as product listing, customer management, booking creation, and availability checking.

## Architecture

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk` - Official MCP implementation
- **HTTP Client**: Axios for API communication
- **Validation**: Zod for runtime type validation
- **Environment**: dotenv for configuration management

### Project Structure
```
victoury-public-api-mcpserver/
├── src/
│   ├── index.ts          # Main server entry point and MCP setup
│   ├── api-client.ts     # Victoury API client implementation
│   └── types.ts          # TypeScript interfaces and Zod schemas
├── tests/                # Test suite (Jest)
├── dist/                 # Compiled JavaScript output
├── .env.example          # Environment configuration template
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies and scripts
└── CLAUDE.md            # This file
```

## MCP Server Implementation

### Available Tools

The server exposes the following tools through MCP:

1. **authenticate**
   - Purpose: Authenticate with Victoury API
   - Parameters: `apiKey`, `apiSecret`
   - Returns: Authentication token

2. **list_products**
   - Purpose: List available tours/products
   - Parameters: `page`, `limit`, `category`, `destination`, `startDate`, `endDate`
   - Returns: Paginated product list

3. **get_product_details**
   - Purpose: Get detailed product information
   - Parameters: `productId`
   - Returns: Complete product details

4. **search_customers**
   - Purpose: Search for customers
   - Parameters: `query`, `email`, `phone`, `page`, `limit`
   - Returns: Customer search results

5. **create_booking**
   - Purpose: Create new booking
   - Parameters: `productId`, `customerId`, `startDate`, `endDate`, `participants`, `notes`
   - Returns: Booking confirmation

6. **get_booking_details**
   - Purpose: Retrieve booking information
   - Parameters: `bookingId`
   - Returns: Booking details

7. **update_booking**
   - Purpose: Modify existing booking
   - Parameters: `bookingId`, `status`, `participants`, `notes`
   - Returns: Updated booking

8. **list_availability**
   - Purpose: Check product availability
   - Parameters: `productId`, `startDate`, `endDate`, `participants`
   - Returns: Availability calendar

### API Client Architecture

The `VictouryAPIClient` class handles:
- HTTP request/response management
- Authentication token persistence
- Error handling and transformation
- Request/response interceptors
- Type-safe method signatures

## Development Setup

### Prerequisites
- Node.js 18+ (for native ES modules support)
- npm or yarn package manager
- Victoury API credentials

### Installation
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your API credentials in .env
```

### Environment Variables
- `VICTOURY_API_URL`: Base URL for Victoury API (default: https://api.victoury.com/v2)
- `VICTOURY_API_KEY`: Your API key
- `VICTOURY_API_SECRET`: Your API secret
- `VICTOURY_API_TIMEOUT`: Request timeout in milliseconds (default: 30000)

## Common Commands

```bash
# Development (with hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Testing Strategy

### Unit Tests
- Test each tool handler independently
- Mock API client responses
- Validate parameter parsing
- Test error scenarios

### Integration Tests
- Test full request/response flow
- Validate MCP protocol compliance
- Test authentication flow
- Verify error propagation

## Error Handling

The server implements comprehensive error handling:

1. **Validation Errors**: Zod schema validation with detailed messages
2. **API Errors**: HTTP status codes and error messages from Victoury
3. **Network Errors**: Connection timeouts and network failures
4. **Authentication Errors**: Token expiration and invalid credentials

All errors are returned in MCP-compliant format with `isError: true`.

## Security Considerations

1. **API Credentials**: Never commit `.env` files; use environment variables
2. **Token Management**: Auth tokens are stored in memory only
3. **Input Validation**: All inputs validated with Zod schemas
4. **HTTPS Only**: API client enforces HTTPS connections
5. **Timeout Protection**: Configurable request timeouts prevent hanging

## API Integration Notes

### Authentication Flow
1. Initial authentication using API key/secret
2. Receive JWT token
3. Include token in subsequent requests
4. Handle token expiration gracefully

### Rate Limiting
- Monitor API response headers for rate limit information
- Implement exponential backoff for retries
- Consider caching for frequently accessed data

### Data Formats
- Dates: ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Currency: Amount in cents, currency code (e.g., EUR, USD)
- Phone numbers: E.164 format preferred
- IDs: String UUIDs

## Extending the Server

### Adding New Tools
1. Define tool schema in `TOOLS` array (index.ts)
2. Add parameter types to types.ts
3. Implement handler in switch statement
4. Add corresponding method to VictouryAPIClient
5. Update tests and documentation

### Adding Resources
For read-only data access, consider implementing MCP resources:
- Product catalogs
- Customer lists
- Booking reports
- Availability calendars

## Debugging

### Enable Debug Logging
```bash
# Set log level
export DEBUG=mcp:*
export VICTOURY_LOG_LEVEL=debug
```

### Common Issues
1. **Authentication fails**: Check API credentials and network access
2. **Type errors**: Ensure all parameters match Zod schemas
3. **Timeout errors**: Increase VICTOURY_API_TIMEOUT
4. **CORS issues**: This is a server-side implementation, no CORS

## Performance Optimization

1. **Connection Pooling**: Axios reuses HTTP connections
2. **Response Caching**: Consider implementing for static data
3. **Pagination**: Use appropriate page sizes for list operations
4. **Selective Fields**: Request only needed fields when API supports it

## Maintenance

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update to latest major versions (careful!)
npm install package@latest
```

### API Version Changes
- Monitor Victoury API changelog
- Test thoroughly with API sandbox
- Update types and validation schemas
- Increment server version appropriately

## Contributing

When making changes:
1. Update types.ts for new data structures
2. Extend api-client.ts for new endpoints
3. Add tool definitions to index.ts
4. Write comprehensive tests
5. Update this documentation
6. Follow TypeScript best practices
7. Ensure all tools return MCP-compliant responses

### Git Commit Guidelines

When committing changes:
1. **Remove Claude-specific artifacts** before committing:
   - Remove any Claude-generated comments or markers
   - Clean up the commit message footer (remove the Claude signature)
   - Remove temporary Claude analysis files
   - Ensure no AI conversation history is included

2. **Clean commit messages**:
   ```bash
   # Instead of the auto-generated Claude message:
   git commit -m "feat: Add new API methods"
   
   # Not this (with Claude artifacts):
   git commit -m "feat: Add new API methods
   
   🤖 Generated with [Claude Code](https://claude.ai/code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Before pushing**:
   - Review all changes for Claude-specific content
   - Check for any temporary analysis files
   - Ensure commit history is clean
   - Remove any debugging console.logs added during development