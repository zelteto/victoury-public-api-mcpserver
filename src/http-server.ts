#!/usr/bin/env node
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { VictouryAPIClient } from './api-client.js';
import fs from 'fs';
import path from 'path';

// Import all the handlers from index.ts
import './index.js';

dotenv.config();

const app = express();
app.use(express.json());

// Logger
const logFile = path.join(process.cwd(), 'victoury-http-debug.log');
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (e) {
    // Ignore
  }
};

// Initialize MCP server
let mcpServer: Server;
let transport: InMemoryTransport;

async function initializeMCPServer() {
  mcpServer = new Server(
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

  // Create in-memory transport
  transport = new InMemoryTransport();
  
  // Connect server to transport
  await mcpServer.connect(transport);
  
  log('MCP Server initialized');
}

// Initialize on startup
initializeMCPServer().catch(console.error);

// API client instance (can be per-request in multi-tenant setup)
let apiClient: VictouryAPIClient;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'victoury-mcp-http-server',
    timestamp: new Date().toISOString() 
  });
});

// List available tools
app.get('/tools', async (req, res) => {
  try {
    const response = await transport.sendRequest({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: Date.now(),
    });
    
    res.json({
      success: true,
      tools: response.result?.tools || []
    });
  } catch (error) {
    log(`Error listing tools: ${error}`);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Execute a tool
app.post('/tools/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const { arguments: args, credentials } = req.body;
  
  try {
    log(`Executing tool: ${toolName} with args: ${JSON.stringify(args)}`);
    
    // If credentials provided, create new client
    if (credentials) {
      apiClient = new VictouryAPIClient({
        baseURL: credentials.apiUrl || process.env.VICTOURY_API_URL!,
        apiKey: credentials.tenant || process.env.VICTOURY_TENANT,
        apiSecret: credentials.sessionId || process.env.VICTOURY_SESSION_ID,
        timeout: parseInt(process.env.VICTOURY_API_TIMEOUT || '30000'),
      });
    } else if (!apiClient) {
      // Create default client from env
      apiClient = new VictouryAPIClient({
        baseURL: process.env.VICTOURY_API_URL!,
        apiKey: process.env.VICTOURY_TENANT,
        apiSecret: process.env.VICTOURY_SESSION_ID,
        timeout: parseInt(process.env.VICTOURY_API_TIMEOUT || '30000'),
      });
    }
    
    const response = await transport.sendRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      },
      id: Date.now(),
    });
    
    res.json({
      success: true,
      result: response.result
    });
  } catch (error) {
    log(`Error executing tool ${toolName}: ${error}`);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Batch execute multiple tools
app.post('/batch', async (req, res) => {
  const { operations, credentials } = req.body;
  
  if (!Array.isArray(operations)) {
    return res.status(400).json({
      success: false,
      error: 'Operations must be an array'
    });
  }
  
  // Set credentials if provided
  if (credentials) {
    apiClient = new VictouryAPIClient({
      baseURL: credentials.apiUrl || process.env.VICTOURY_API_URL!,
      apiKey: credentials.tenant || process.env.VICTOURY_TENANT,
      apiSecret: credentials.sessionId || process.env.VICTOURY_SESSION_ID,
      timeout: parseInt(process.env.VICTOURY_API_TIMEOUT || '30000'),
    });
  }
  
  const results = [];
  
  for (const op of operations) {
    try {
      const response = await transport.sendRequest({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: op.tool,
          arguments: op.arguments
        },
        id: Date.now(),
      });
      
      results.push({
        tool: op.tool,
        success: true,
        result: response.result
      });
    } catch (error) {
      results.push({
        tool: op.tool,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  res.json({
    success: true,
    results
  });
});

// Start server
const PORT = process.env.HTTP_PORT || 3000;
app.listen(PORT, () => {
  log(`HTTP MCP Server running on port ${PORT}`);
  console.log(`
🚀 Victoury MCP HTTP Server
==========================
Port: ${PORT}
Health: http://localhost:${PORT}/health
Tools: http://localhost:${PORT}/tools

Example usage:
POST http://localhost:${PORT}/tools/list_products
{
  "arguments": {
    "limit": 10
  }
}
  `);
});