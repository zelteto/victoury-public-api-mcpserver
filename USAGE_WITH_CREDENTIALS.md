# Using the MCP Server with Dynamic Credentials

This document explains how to use the Victoury MCP Server with call-based credentials for Claude Desktop, Docker, and n8n.

## Overview

Each MCP tool now accepts an optional `credentials` parameter containing:
- `url`: API base URL (e.g., https://api.victoury.com/v2)
- `tenant`: Tenant identifier
- `sessionId`: Session ID for authentication

## Usage Examples

### 1. Claude Desktop

When using the MCP server in Claude Desktop, provide credentials with each tool call:

```
Use the list_products tool with these parameters:
{
  "category": "tours",
  "limit": 10,
  "credentials": {
    "url": "https://api.client-a.victoury.com/v2",
    "tenant": "client-a-tenant-id",
    "sessionId": "session-123456"
  }
}
```

### 2. Docker Deployments

For Docker deployments, you can still use environment variables as defaults:

```yaml
# docker-compose.yml
services:
  mcp-server:
    image: victoury-mcp-server
    environment:
      - VICTOURY_API_URL=https://api.victoury.com/v2
      - VICTOURY_API_KEY=default-tenant
      - VICTOURY_API_SECRET=default-session
```

But clients can override with per-call credentials:

```json
{
  "tool": "get_product_details",
  "arguments": {
    "productId": "12345",
    "credentials": {
      "url": "https://api.client-specific.victoury.com/v2",
      "tenant": "client-specific-tenant",
      "sessionId": "client-specific-session"
    }
  }
}
```

### 3. n8n Integration

In n8n workflows, you can dynamically set credentials:

```javascript
// n8n Function node
return {
  json: {
    tool: "search_customers",
    arguments: {
      query: "john@example.com",
      credentials: {
        url: $node["Credentials"].json["apiUrl"],
        tenant: $node["Credentials"].json["tenant"],
        sessionId: $node["Credentials"].json["sessionId"]
      }
    }
  }
};
```

## Security Notes

1. **HTTPS Required**: Always use HTTPS URLs for API endpoints
2. **Credential Storage**: Store credentials securely in your environment
3. **Session Management**: Handle session expiration gracefully
4. **Access Control**: Validate credentials before making API calls

## Testing

To test with dynamic credentials:

```bash
# Start the MCP server
npm start

# In another terminal, use the MCP client with credentials
mcp-client call victoury-api-server list_products '{
  "limit": 5,
  "credentials": {
    "url": "https://api.test.victoury.com/v2",
    "tenant": "test-tenant",
    "sessionId": "test-session"
  }
}'
```

## Fallback Behavior

If credentials are not provided in the request, the server falls back to environment variables:
- `VICTOURY_API_URL`
- `VICTOURY_API_KEY` (used as tenant)
- `VICTOURY_API_SECRET` (used as sessionId)

This allows for backward compatibility while supporting dynamic credentials.