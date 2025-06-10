#!/bin/bash

echo "🚀 Starting Victoury MCP Server with n8n..."

# Build the project first
echo "📦 Building project..."
npm install
npm run build

# Start Docker services
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.local.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🏥 Checking service health..."
curl -s http://localhost:3000/health | jq .
echo ""

# Show access info
echo "✅ Services are running!"
echo ""
echo "📍 Access points:"
echo "  - n8n UI: http://localhost:5678"
echo "  - MCP Server: http://localhost:3000"
echo "  - Health Check: http://localhost:3000/health"
echo ""
echo "🔧 In n8n, use these URLs:"
echo "  - From n8n: http://victoury-mcp:3000/tools/{tool-name}"
echo "  - From host: http://localhost:3000/tools/{tool-name}"
echo ""
echo "📝 Example n8n HTTP Request:"
echo '  URL: http://victoury-mcp:3000/tools/list_products'
echo '  Body: {
    "arguments": { "limit": 5 },
    "credentials": {
      "apiUrl": "https://api.victoury.com/v2",
      "tenant": "your-tenant",
      "sessionId": "your-session"
    }
  }'
echo ""
echo "🛑 To stop: docker-compose -f docker-compose.local.yml down"