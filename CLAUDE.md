# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the Victoury Public API FastMCP Server.

## Project Overview

This is a FastMCP server implementation for the Victoury Public API v2. The server provides a standardized interface for AI agents to interact with Victoury's travel management platform, enabling operations such as deal management, service monitoring, and more. Built with FastMCP for modern, decorator-based development with dynamic credential support.

## Architecture

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **MCP Framework**: `fastmcp` - Modern, decorator-based MCP framework
- **HTTP Client**: Axios for API communication
- **Validation**: Zod for runtime type validation
- **Dynamic Credentials**: No environment variables - all credentials passed per request

### Project Structure
```
victoury-public-api-mcpserver/
├── src/
│   ├── index.ts              # Main FastMCP server entry point
│   ├── types.ts              # TypeScript interfaces and Zod schemas
│   ├── tools/                # Tool implementations by category
│   │   ├── service-monitoring.ts  # API health and info endpoints
│   │   └── deal.ts               # Deal management tools
│   └── utils/
│       └── api-client.ts     # HTTP request utility functions
├── fastmcp/                  # FastMCP specification and docs
├── tests/                    # Test suite (Jest)
├── dist/                     # Compiled JavaScript output
├── docs/                     # API documentation (markdown files)
├── tsconfig.json             # TypeScript configuration
├── package.json              # Project dependencies and scripts
└── CLAUDE.md                # This file
```

## FastMCP Server Implementation

### Key Features

1. **Dynamic Credentials**: Every tool call requires credentials as a parameter
2. **No Environment Variables**: Pure per-request configuration
3. **Multi-tenant Support**: Switch tenants/environments per call
4. **Type Safety**: Full TypeScript and Zod validation
5. **Modular Structure**: Tools organized by category
6. **Clear Documentation**: Comprehensive docstrings with examples

### Available Tools

The server exposes the following tools through FastMCP:

#### Service Monitoring (No Versioning)
1. **get_api_info**
   - Purpose: Retrieve API version and environment information
   - Parameters: `credentials` (required)
   - Returns: API version, environment details
   - Note: Uses `/info` endpoint (not `/v2/info`)

2. **get_api_health**
   - Purpose: Check API health status and service availability
   - Parameters: `credentials` (required)
   - Returns: Health status of API components
   - Note: Uses `/health` endpoint (not `/v2/health`)

#### Deal Management
3. **get_deal_details**
   - Purpose: Retrieve comprehensive deal information
   - Parameters: `dealUuid`, `credentials` (required)
   - Returns: Complete deal details including customer info, travelers, arrangements

4. **update_deal**
   - Purpose: Update deal information (PATCH)
   - Parameters: `dealId`, `updateData`, `credentials` (required)
   - Returns: Updated deal object
   - Supports: Custom fields, person-customer addresses

5. **search_deals**
   - Purpose: Search deals with flexible criteria
   - Parameters: `searchRequest`, `credentials` (required)
   - Returns: Array of matching deals with pagination
   - Features: Multiple search criteria, sorting, pagination

6. **create_option_booking**
   - Purpose: Create option (hold) or booking for products
   - Parameters: `bookingData`, `credentials` (required)
   - Returns: Created option/booking details
   - Note: Automatically creates Customer Payments entry

### Credentials Management

**CRITICAL**: Every tool requires dynamic credentials. No environment variables are used.

#### Credential Structure
```typescript
credentials: {
  url: string;      // API base URL (e.g., https://api.victoury.com/v2)
  tenant: string;   // Tenant identifier
  sessionId: string; // Session ID for authentication
}
```

#### Usage Example
```json
{
  "dealUuid": "62454f5113424008888b1c2c",
  "credentials": {
    "url": "https://api.acceptation-victoury.net/v2",
    "tenant": "my-tenant",
    "sessionId": "my-session-id"
  }
}
```

### API Client Architecture

The FastMCP implementation uses a centralized API client utility:

#### `makeVictouryRequest` Function
- Handles dynamic credential usage
- Manages versioning logic (service monitoring endpoints don't use /v2)
- Transforms errors into user-friendly messages
- Supports timeout configuration
- Provides consistent header setup

#### Error Handling
1. **Validation Errors**: Zod schema validation with detailed messages
2. **API Errors**: Transformed HTTP responses with status codes
3. **Network Errors**: Connection timeouts and network failures
4. **Authentication Errors**: Invalid credentials handling

### Tool Development Pattern

All FastMCP tools follow this consistent pattern:

```typescript
@mcp.tool
async function tool_name(
  // Tool-specific required parameters first
  requiredParam: string,
  
  // Tool-specific optional parameters  
  optionalParam?: string,
  
  // Credentials ALWAYS last and ALWAYS required
  credentials: z.infer<typeof VictouryCredentials>
): Promise<ReturnType> {
  """Clear tool description with parameter documentation.
  
  Args:
    requiredParam: Description of required parameter
    optionalParam: Description of optional parameter
    credentials: API credentials (url, tenant, sessionId) - REQUIRED
  
  Returns:
    Description of return value with examples
  """
  
  // 1. Validate credentials
  const validatedCreds = VictouryCredentials.parse(credentials);
  
  // 2. Validate other parameters if needed
  // 3. Make API request using makeVictouryRequest
  // 4. Return structured response
}
```

## Development Setup

### Prerequisites
- Node.js 18+ (FastMCP requires modern Node.js)
- npm or yarn package manager
- No Victoury API credentials needed in environment

### Installation
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run development server with hot reload
npm run dev

# Run production server
npm start
```

### Common Commands

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
- Mock API client responses with different credentials
- Validate parameter parsing and credential validation
- Test error scenarios with malformed credentials

### Integration Tests
- Test full request/response flow with real credentials
- Validate FastMCP protocol compliance
- Test multi-tenant credential switching
- Verify error propagation

### Testing with Dynamic Credentials
```typescript
// Example test with different credentials
it('should handle multiple tenants', async () => {
  const tenant1Creds = {
    url: 'https://api.tenant1.victoury.net/v2',
    tenant: 'tenant1',
    sessionId: 'session1'
  };
  
  const tenant2Creds = {
    url: 'https://api.tenant2.victoury.net/v2', 
    tenant: 'tenant2',
    sessionId: 'session2'
  };
  
  // Test same tool with different credentials
  const result1 = await client.call_tool('get_api_info', { credentials: tenant1Creds });
  const result2 = await client.call_tool('get_api_info', { credentials: tenant2Creds });
  
  // Verify different environments were accessed
});
```

## Security Considerations

1. **No Credential Storage**: All credentials passed per request, never stored
2. **Input Validation**: All inputs validated with Zod schemas
3. **HTTPS Only**: API client enforces HTTPS connections
4. **Timeout Protection**: Configurable request timeouts prevent hanging
5. **Error Sanitization**: API errors transformed to prevent information leakage

## API Integration Notes

### Authentication Flow
- Per-request authentication using credentials parameter
- Tenant code in `Tenant` header
- Session ID in `Session-Id` header
- No token management or storage needed

### Versioning
- Most endpoints use `/v2/` in URL path
- Service monitoring endpoints (`/info`, `/health`) don't use versioning
- `makeVictouryRequest` handles versioning logic automatically

### Rate Limiting
- Monitor API response headers for rate limit information
- Consider implementing client-side rate limiting for high-volume usage
- Each credential set has independent rate limits

### Data Formats
- Dates: ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Currency: Amount in cents, currency code (e.g., EUR, USD)
- Phone numbers: E.164 format preferred
- IDs: String UUIDs

## Extending the Server

### Adding New Tools
1. Create new tool file in `src/tools/` directory
2. Define tool function with `@mcp.tool` decorator
3. Add parameter types to `types.ts`
4. Register tools in main server file (`src/index.ts`)
5. Update tests and documentation

### Adding New Tool Categories
1. Create new file in `src/tools/category-name.ts`
2. Export registration function: `registerCategoryTools(mcp: FastMCP)`
3. Import and call in main server file
4. Document new category in this file

### Example New Tool
```typescript
// src/tools/product.ts
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { VictouryCredentials } from '../types.js';
import { makeVictouryRequest } from '../utils/api-client.js';

export function registerProductTools(mcp: FastMCP) {
  @mcp.tool
  async function get_product_details(
    productId: string,
    credentials: z.infer<typeof VictouryCredentials>
  ) {
    """Get detailed product information.
    
    Args:
      productId: Unique identifier of the product
      credentials: API credentials (url, tenant, sessionId) - REQUIRED
    
    Returns:
      Detailed product information including pricing, availability, descriptions.
    """
    if (!productId.trim()) {
      throw new Error('productId is required and cannot be empty');
    }
    
    const validatedCreds = VictouryCredentials.parse(credentials);
    
    return await makeVictouryRequest(validatedCreds, {
      method: 'GET',
      endpoint: `/products/${productId}.json`
    });
  }
}
```

## Debugging

### Enable Debug Logging
FastMCP provides built-in logging. Check FastMCP documentation for logging configuration.

### Common Issues
1. **Decorator Errors**: Ensure `experimentalDecorators: true` in tsconfig.json
2. **Import Errors**: Use `.js` extensions for TypeScript imports in Node.js ESM
3. **Credential Validation**: All credentials must pass Zod schema validation
4. **API Errors**: Check credential validity and API endpoint availability

### Error Debugging
The server provides detailed error messages:
- **Validation Errors**: Zod validation with field-specific messages
- **API Errors**: HTTP status codes with Victoury error details
- **Network Errors**: Connection and timeout information

## Performance Optimization

1. **Request Efficiency**: Single API client instance with connection pooling
2. **Error Caching**: Consider caching error responses to prevent repeated failed calls
3. **Credential Validation**: Fast Zod validation before API calls
4. **Async Operations**: All tools are async for non-blocking execution

## Maintenance

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update FastMCP specifically
npm install fastmcp@latest
```

### API Version Changes
- Monitor Victoury API changelog
- Test thoroughly with API sandbox using test credentials
- Update types and validation schemas in `src/types.ts`
- Update tool implementations as needed
- Increment server version appropriately

## Contributing

When making changes:
1. Update `src/types.ts` for new data structures
2. Implement tools in appropriate category files in `src/tools/`
3. Add tool registration in `src/index.ts`
4. Write comprehensive tests with credential variations
5. Update this documentation
6. Follow TypeScript and FastMCP best practices
7. Ensure all tools require credentials parameter

### Git Commit Guidelines

When committing changes:
1. **Remove Claude-specific artifacts** before committing:
   - Remove any Claude-generated comments or markers
   - Clean up the commit message footer (remove the Claude signature)
   - Remove temporary Claude analysis files
   - Ensure no AI conversation history is included

2. **Clean commit messages**:
   ```bash
   # Clean commit message:
   git commit -m "feat: Add product management tools to FastMCP server"
   
   # Not this (with Claude artifacts):
   git commit -m "feat: Add product management tools
   
   🤖 Generated with [Claude Code](https://claude.ai/code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Before pushing**:
   - Review all changes for Claude-specific content
   - Check for any temporary analysis files
   - Ensure commit history is clean
   - Remove any debugging console.logs added during development

## FastMCP Specific Notes

### Decorator Usage
FastMCP uses modern decorator syntax:
```typescript
@mcp.tool  // No parentheses needed (naked decorator)
async function my_tool() { ... }
```

### Server Instructions
The server includes comprehensive instructions that appear in Claude Desktop and other MCP clients, explaining:
- Available tool categories
- Credential requirements
- Usage examples
- Base URLs for different environments

### Multi-tenant Architecture
This implementation is designed for multi-tenant usage:
- Each API call includes full credentials
- No shared state between requests
- Environment switching per request
- Isolated error handling per credential set

### Future Enhancements
1. Add remaining API categories (Product, Customer, Document, etc.)
2. Implement response caching with credential-based cache keys
3. Add request retry logic with exponential backoff
4. Support for batch operations
5. WebSocket support for real-time updates
6. Enhanced error recovery mechanisms