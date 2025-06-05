#!/bin/bash
# Quick setup script for Claude Desktop with Docker

set -e

echo "🚀 Victoury MCP Server - Claude Desktop Setup"
echo "============================================"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required. Please install Docker Desktop."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ Node.js is required. Please install Node.js."; exit 1; }

# Build TypeScript
echo "📦 Building TypeScript files..."
npm install
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
cd deployment
docker build -f Dockerfile.mcp -t victoury-mcp:stdio ..

# Create example environment if it doesn't exist
if [ ! -f "envs/example.env" ]; then
    echo "📝 Creating example environment file..."
    cat > envs/example.env << 'EOF'
# Victoury API Configuration
VICTOURY_API_URL=https://api.victoury.com/v2
VICTOURY_TENANT=your_tenant_id_here
VICTOURY_SESSION_ID=your_session_id_here
LOG_LEVEL=info
EOF
fi

# Copy to production if it doesn't exist
if [ ! -f "envs/production.env" ]; then
    echo "📝 Creating production environment file..."
    cp envs/example.env envs/production.env
    echo "⚠️  Please edit envs/production.env with your actual credentials!"
fi

# Make wrapper executable
chmod +x docker-mcp-wrapper.sh

# Detect OS and show config
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit deployment/envs/production.env with your Victoury credentials"
echo ""
echo "2. Add to Claude Desktop config:"
echo ""

# Get full path
WRAPPER_PATH="$(cd "$(dirname "$0")" && pwd)/deployment/docker-mcp-wrapper.sh"

if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_PATH="~/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    CONFIG_PATH="%APPDATA%\\Claude\\claude_desktop_config.json"
    WRAPPER_PATH=$(cygpath -w "$WRAPPER_PATH" 2>/dev/null || echo "$WRAPPER_PATH")
else
    CONFIG_PATH="~/.config/Claude/claude_desktop_config.json"
fi

cat << EOF
{
  "mcpServers": {
    "victoury": {
      "command": "$WRAPPER_PATH",
      "args": ["production"]
    }
  }
}
EOF

echo ""
echo "Config file location: $CONFIG_PATH"
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "🧪 To test the setup:"
echo "   cd deployment"
echo "   ./docker-mcp-wrapper.sh production"