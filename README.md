# Victoury Public API FastMCP Server

A modern FastMCP server implementation for the Victoury Public API v2, providing comprehensive access to Victoury's travel management platform with **dynamic credential support**. This server enables AI agents to perform travel operations across multiple tenants and environments seamlessly.

## ✨ Key Features

### 🔐 **Dynamic Credentials**
- **No environment variables required** - credentials passed per request
- **Multi-tenant support** - switch tenants/environments dynamically
- **Secure** - credentials never stored in configuration

### 🚀 **Modern FastMCP Implementation**
- Built with [FastMCP TypeScript](https://github.com/punkpeye/fastmcp)
- Full TypeScript support with Zod validation
- Comprehensive tool descriptions and examples
- Real-time error handling and debugging

### 📋 **Comprehensive API Coverage**
- **Service Monitoring**: API health and version info
- **Deal Management**: Create, update, search deals and bookings
- **Product Operations**: Listings, details, pricing, availability
- **Customer Management**: Search and update customer information
- **Document Handling**: View and download travel documents
- **Payment Processing**: Register customer payments

## 🛠️ Installation

### From Source
```bash
git clone https://github.com/yourusername/victoury-public-api-mcpserver.git
cd victoury-public-api-mcpserver
npm install
npm run build
```

## ⚙️ Claude Desktop Configuration

### Step 1: Locate Configuration File

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Add FastMCP Server

Edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "victoury-fastmcp": {
      "command": "node",
      "args": ["/path/to/victoury-public-api-mcpserver/dist/index.js"]
    }
  }
}
```

**Replace `/path/to/` with your actual project path, for example:**
- Windows: `"C:\\Projects\\victoury-public-api-mcpserver\\dist\\index.js"`
- macOS/Linux: `"/home/user/projects/victoury-public-api-mcpserver/dist/index.js"`

### Step 3: Build and Restart

```bash
# Build the server
npm run build

# Restart Claude Desktop to load the new configuration
```

## 🎯 Usage with Dynamic Credentials

Unlike traditional MCP servers, this FastMCP implementation requires credentials with **every** tool call:

### Example: Check API Health
```
Can you check the Victoury API health using these credentials:
- url: https://api.acceptation-victoury.net/v2
- tenant: my-tenant-code
- sessionId: my-session-id
```

### Example: Get Deal Details
```
Get deal details for UUID "62454f5113424008888b1c2c" using:
- url: https://api.victoury.com/v2
- tenant: production-tenant
- sessionId: prod-session-id
```

### Example: Multi-tenant Usage
```
Check the API health for both environments:
1. Testing: url=https://api.acceptation-victoury.net/v2, tenant=test-tenant, sessionId=test-session
2. Production: url=https://api.victoury.com/v2, tenant=prod-tenant, sessionId=prod-session
```

## 🔧 Available Tools

### Service Monitoring (No Versioning)
- **`get_api_info`**: Retrieve API version and environment information
- **`get_api_health`**: Check API health status and service availability

*Note: These endpoints use `/info` and `/health` (no `/v2` prefix)*

### Deal Management
- **`get_deal_details`**: Retrieve comprehensive deal information by UUID
- **`update_deal`**: Update deal fields (custom fields, addresses, etc.)
- **`search_deals`**: Search deals with flexible criteria and pagination  
- **`create_option_booking`**: Create option (hold) or booking for products

## 📊 Tool Parameter Examples

### Service Monitoring
```javascript
// get_api_health
{
  "credentials": {
    "url": "https://api.acceptation-victoury.net/v2",
    "tenant": "my-tenant",
    "sessionId": "my-session-id"
  }
}
```

### Deal Management
```javascript
// get_deal_details
{
  "dealUuid": "62454f5113424008888b1c2c",
  "credentials": {
    "url": "https://api.victoury.com/v2",
    "tenant": "my-tenant",
    "sessionId": "my-session-id"
  }
}

// search_deals
{
  "searchRequest": {
    "criteria": {
      "status": "active",
      "startDate": "2024-01-01"
    },
    "count": 50,
    "page": 1,
    "sort": "startDate:desc"
  },
  "credentials": {
    "url": "https://api.victoury.com/v2",
    "tenant": "my-tenant", 
    "sessionId": "my-session-id"
  }
}

// create_option_booking
{
  "bookingData": {
    "type": "O",
    "productId": "123",
    "startDate": "2024-07-01",
    "endDate": "2024-07-08", 
    "numberOfTravelers": 2,
    "mainTraveler": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "optionExpiryDate": "2024-06-01"
  },
  "credentials": {
    "url": "https://api.acceptation-victoury.net/v2",
    "tenant": "my-tenant",
    "sessionId": "my-session-id"
  }
}
```

## 🌐 Environment URLs

### Production
```
https://api.victoury.com/v2
```

### Testing/Staging  
```
https://api.acceptation-victoury.net/v2
```

## 🔄 Migration from Old MCP Server

If you're upgrading from the old MCP SDK implementation:

### Old Configuration (Remove This)
```json
{
  "mcpServers": {
    "victoury-api": {
      "command": "node",
      "args": ["/path/to/old/server/dist/index.js"],
      "env": {
        "VICTOURY_API_URL": "https://api.victoury.com/v2",
        "VICTOURY_API_KEY": "your-tenant",
        "VICTOURY_API_SECRET": "your-session-id"
      }
    }
  }
}
```

### New Configuration (Use This)
```json
{
  "mcpServers": {
    "victoury-fastmcp": {
      "command": "node", 
      "args": ["/path/to/victoury-public-api-mcpserver/dist/index.js"]
    }
  }
}
```

### Key Differences
| Old MCP Server | New FastMCP Server |
|---|---|
| Environment variables in config | Dynamic credentials per call |
| Fixed tenant/environment | Multi-tenant per request |
| Complex configuration | Simple configuration |
| Manual credential management | Credentials passed with each call |

## 🛠️ Development

### Commands
```bash
# Development with hot reload
npm run dev

# Build for production  
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

### Project Structure
```
src/
├── index.ts              # Main FastMCP server
├── types.ts              # TypeScript types and Zod schemas
└── utils/
    └── api-client.ts     # HTTP request utility
```

## 🔍 Testing Your Setup

### Method 1: Using MCP Inspector
```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Build your server
npm run build

# Test with inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

### Method 2: Claude Desktop Integration
1. Configure Claude Desktop (steps above)
2. Restart Claude Desktop
3. Ask Claude: "What MCP tools do you have available?"
4. Test a tool: "Check the API health using url=..., tenant=..., sessionId=..."

## 🐛 Troubleshooting

### Claude Desktop Not Seeing Server
1. Check the file path in configuration is correct
2. Ensure the server builds successfully (`npm run build`)
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

### Tool Calls Failing
1. Verify credentials are valid
2. Check network connectivity to Victoury API
3. Ensure correct URL format (with/without `/v2`)
4. Validate tenant and sessionId format

### Common Issues
- **Path separators**: Use forward slashes `/` or escaped backslashes `\\` in JSON
- **Build required**: Always run `npm run build` after code changes
- **Absolute paths**: Use full absolute paths in Claude Desktop config

## 🔒 Security

- **No credential storage**: Credentials never stored in configuration or logs
- **Per-request auth**: Each API call uses provided credentials
- **Input validation**: All inputs validated with Zod schemas
- **HTTPS enforcement**: All API calls use HTTPS
- **Error sanitization**: Sensitive information filtered from error messages

## 📚 Additional Resources

- [FastMCP Documentation](https://github.com/punkpeye/fastmcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude Desktop Configuration](https://docs.anthropic.com/claude/docs/claude-desktop)
- [Victoury API Documentation](./docs/README.md)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact Victoury support for API-specific questions
- Check the [FastMCP documentation](https://github.com/punkpeye/fastmcp) for framework details