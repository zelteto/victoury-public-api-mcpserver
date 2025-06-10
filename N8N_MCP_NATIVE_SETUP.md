# n8n Native MCP Integration Setup

## Overview

n8n version 1.95+ includes native MCP (Model Context Protocol) support through two key nodes:
- **MCP Server Trigger** - Makes n8n act as an MCP server
- **MCP Client Tool** - Connects n8n to external MCP servers

## For Your Victoury MCP Server

You have two options:

### Option 1: Use MCP Client Tool Node (Recommended)

The MCP Client Tool node allows n8n to connect to your Victoury MCP server.

#### Setup Steps:

1. **In n8n workflow**:
   - Add an **AI Agent** node
   - Add an **MCP Client Tool** node
   - Connect the MCP Client Tool to the AI Agent as a tool

2. **Configure MCP Client Tool**:
   ```json
   {
     "name": "Victoury API",
     "transport": "http",
     "url": "http://victoury-mcp:3000",
     "authentication": "none"
   }
   ```

3. **The MCP Client will automatically discover available tools** from your server's `/tools` endpoint

### Option 2: Create n8n as MCP Server

Use the **MCP Server Trigger** node to expose n8n workflows to MCP clients like Claude Desktop.

#### Setup:

1. **Add MCP Server Trigger node**
2. **Add Custom n8n Workflow Tool nodes** for each operation
3. **Configure authentication** (Bearer token recommended)

## Converting Your HTTP Server to MCP Protocol

Your current HTTP server needs slight modifications to be fully MCP-compliant:

### Required Changes:

1. **Implement MCP protocol endpoints**:
   - `/mcp/v1/list_tools` - List available tools
   - `/mcp/v1/call_tool` - Execute tools
   - Use Server-Sent Events (SSE) for responses

2. **Update response format** to MCP standard:
   ```json
   {
     "jsonrpc": "2.0",
     "result": {
       "tools": [
         {
           "name": "list_products",
           "description": "List Victoury products",
           "inputSchema": {
             "type": "object",
             "properties": {
               "limit": { "type": "number" },
               "page": { "type": "number" }
             }
           }
         }
       ]
     },
     "id": 1
   }
   ```

## Example n8n Workflow with MCP Client Tool

```json
{
  "name": "Victoury MCP Integration",
  "nodes": [
    {
      "parameters": {},
      "name": "Chat Trigger",
      "type": "@n8n/n8n-nodes-langchain.chatTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "name": "Victoury API",
        "description": "Access Victoury travel API",
        "transport": "http",
        "baseUrl": "http://victoury-mcp:3000/mcp/v1",
        "headers": {
          "X-API-Key": "{{ $credentials.apiKey }}"
        }
      },
      "name": "MCP Client - Victoury",
      "type": "@n8n/n8n-nodes-langchain.toolMcp",
      "position": [450, 400]
    },
    {
      "parameters": {
        "model": "gpt-4",
        "tools": ["MCP Client - Victoury"]
      },
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Chat Trigger": {
      "main": [
        [{
          "node": "AI Agent",
          "type": "main",
          "index": 0
        }]
      ]
    },
    "MCP Client - Victoury": {
      "ai_tool": [
        [{
          "node": "AI Agent",
          "type": "ai_tool",
          "index": 0
        }]
      ]
    }
  }
}
```

## Quick HTTP-to-MCP Adapter

Since your server already works via HTTP, you can create a simple adapter:

```typescript
// mcp-adapter.ts
import express from 'express';
import { SSE } from 'express-sse';

const app = express();
const sse = new SSE();

// MCP list tools endpoint
app.get('/mcp/v1/list_tools', sse.init, async (req, res) => {
  const tools = await fetch('http://localhost:3000/tools').then(r => r.json());
  
  sse.send({
    jsonrpc: "2.0",
    result: {
      tools: tools.tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: {
          type: "object",
          properties: {
            arguments: { type: "object" },
            credentials: { type: "object" }
          }
        }
      }))
    },
    id: 1
  });
});

// MCP call tool endpoint
app.post('/mcp/v1/call_tool', express.json(), async (req, res) => {
  const { tool, arguments: args } = req.body;
  
  const result = await fetch(`http://localhost:3000/tools/${tool}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arguments: args })
  }).then(r => r.json());
  
  res.json({
    jsonrpc: "2.0",
    result: result,
    id: req.body.id
  });
});

app.listen(3001);
```

## Testing in n8n

1. **Check if MCP nodes are available**:
   - Search for "MCP" in the node panel
   - You should see "MCP Client Tool" and "MCP Server Trigger"

2. **If not available**, you might need to:
   - Update n8n to latest version
   - Enable experimental features
   - Install the MCP nodes package

## Benefits of Native MCP Integration

1. **Automatic tool discovery** - No manual HTTP configuration
2. **Built-in AI Agent integration** - Works seamlessly with LangChain
3. **Standardized protocol** - Compatible with Claude, ChatGPT, etc.
4. **Better error handling** - MCP protocol includes error standards
5. **Streaming support** - SSE enables real-time responses

## Next Steps

1. Check if MCP nodes are available in your n8n instance
2. Either adapt your HTTP server to MCP protocol
3. Or continue using HTTP Request nodes (current approach)
4. Consider implementing a hybrid approach with both HTTP and MCP endpoints