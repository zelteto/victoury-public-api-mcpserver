# n8n Testing Examples for Victoury MCP Server

## 1. Basic Health Check

**HTTP Request Node:**
- Method: `GET`
- URL: `http://victoury-mcp:3000/health`

Expected Response:
```json
{
  "status": "healthy",
  "service": "victoury-mcp-http-server",
  "timestamp": "2025-06-09T22:41:19.566Z"
}
```

## 2. List Available Tools

**HTTP Request Node:**
- Method: `GET`
- URL: `http://victoury-mcp:3000/tools`

This will show all available MCP tools.

## 3. List Products

**HTTP Request Node:**
- Method: `POST`
- URL: `http://victoury-mcp:3000/tools/list_products`
- Body:
```json
{
  "arguments": {
    "limit": 10,
    "page": 1,
    "category": "tours"
  },
  "credentials": {
    "apiUrl": "https://api.victoury.com/v2",
    "tenant": "your-tenant",
    "sessionId": "your-session"
  }
}
```

## 4. Search Customers

**HTTP Request Node:**
- Method: `POST`
- URL: `http://victoury-mcp:3000/tools/search_customers`
- Body:
```json
{
  "arguments": {
    "email": "customer@example.com"
  },
  "credentials": {
    "apiUrl": "https://api.victoury.com/v2",
    "tenant": "your-tenant",
    "sessionId": "your-session"
  }
}
```

## 5. Multi-Environment Test

Use a **Code** node to test multiple environments:

```javascript
const environments = [
  {
    name: "Production",
    credentials: {
      apiUrl: "https://api.victoury.com/v2",
      tenant: "prod-tenant",
      sessionId: "prod-session"
    }
  },
  {
    name: "Staging",
    credentials: {
      apiUrl: "https://staging.victoury.com/v2",
      tenant: "staging-tenant",
      sessionId: "staging-session"
    }
  }
];

const results = [];

for (const env of environments) {
  try {
    const response = await $http.request({
      method: 'POST',
      url: 'http://victoury-mcp:3000/tools/list_products',
      body: {
        arguments: { limit: 3 },
        credentials: env.credentials
      }
    });
    
    results.push({
      environment: env.name,
      success: response.success,
      productCount: response.result?.data?.length || 0
    });
  } catch (error) {
    results.push({
      environment: env.name,
      success: false,
      error: error.message
    });
  }
}

return results;
```

## 6. Error Handling Example

**HTTP Request Node with Error Handling:**

1. Add HTTP Request node
2. Add an **Error Trigger** node
3. Connect them
4. Test with invalid credentials:

```json
{
  "arguments": { "limit": 5 },
  "credentials": {
    "apiUrl": "https://api.victoury.com/v2",
    "tenant": "invalid-tenant",
    "sessionId": "invalid-session"
  }
}
```

## 7. Using n8n Variables

Store credentials in n8n variables:
1. Go to **Variables** in n8n
2. Add:
   - `victoury_tenant`: your-tenant
   - `victoury_session`: your-session

Then use in HTTP Request:
```json
{
  "arguments": { "limit": 5 },
  "credentials": {
    "apiUrl": "https://api.victoury.com/v2",
    "tenant": "{{ $vars.victoury_tenant }}",
    "sessionId": "{{ $vars.victoury_session }}"
  }
}
```

## Common Issues

1. **Connection Refused**: Make sure to use `http://victoury-mcp:3000` (not localhost)
2. **No Response**: Check Docker logs: `docker logs victoury-mcp-local`
3. **Authentication Error**: Verify your Victoury credentials are correct