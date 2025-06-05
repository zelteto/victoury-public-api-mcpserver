# Claude Desktop MCP Setup with Docker

This guide shows how to run the Victoury MCP server in Docker for use with Claude Desktop.

## Prerequisites

- Docker Desktop installed and running
- Claude Desktop installed
- Git

## Setup Steps

### 1. Clone and Build

```bash
# Clone the repository
git clone https://github.com/yourorg/victoury-mcp-server.git
cd victoury-mcp-server

# Build the TypeScript files
npm install
npm run build

# Build Docker image for MCP
cd deployment
docker build -f Dockerfile.mcp -t victoury-mcp:stdio ..
```

### 2. Create Environment Configuration

```bash
# Copy example environment
cp envs/example.env envs/production.env

# Edit with your credentials
nano envs/production.env
```

Example `envs/production.env`:
```bash
VICTOURY_API_URL=https://api.victoury.com/v2
VICTOURY_TENANT=YOUR_TENANT_ID
VICTOURY_SESSION_ID=YOUR_SESSION_ID
LOG_LEVEL=info
```

### 3. Test the Docker Setup

```bash
# Test that it works (should show MCP protocol output)
./docker-mcp-wrapper.sh production
# Press Ctrl+C to exit
```

### 4. Configure Claude Desktop

Add to your Claude Desktop configuration file:

**Windows** (`%APPDATA%\Claude\claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "victoury": {
      "command": "C:\\path\\to\\victoury-mcp-server\\deployment\\docker-mcp-wrapper.sh",
      "args": ["production"]
    }
  }
}
```

**macOS** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "victoury": {
      "command": "/Users/you/victoury-mcp-server/deployment/docker-mcp-wrapper.sh",
      "args": ["production"]
    }
  }
}
```

**Linux** (`~/.config/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "victoury": {
      "command": "/home/you/victoury-mcp-server/deployment/docker-mcp-wrapper.sh",
      "args": ["production"]
    }
  }
}
```

## Multiple Environments in Claude

You can configure multiple environments:

```json
{
  "mcpServers": {
    "victoury-prod": {
      "command": "/path/to/deployment/docker-mcp-wrapper.sh",
      "args": ["production"]
    },
    "victoury-dev": {
      "command": "/path/to/deployment/docker-mcp-wrapper.sh",
      "args": ["development"]
    },
    "victoury-client-a": {
      "command": "/path/to/deployment/docker-mcp-wrapper.sh",
      "args": ["client-a-prod"]
    }
  }
}
```

## Windows-Specific Setup

For Windows, you might need a batch file wrapper:

Create `deployment/docker-mcp-wrapper.bat`:
```batch
@echo off
set ENV_NAME=%1
if "%ENV_NAME%"=="" set ENV_NAME=production

set SCRIPT_DIR=%~dp0
set ENV_FILE=%SCRIPT_DIR%envs\%ENV_NAME%.env

if not exist "%ENV_FILE%" (
    echo Error: Environment file not found: %ENV_FILE% >&2
    echo Please create it from the example: >&2
    echo   copy %SCRIPT_DIR%envs\example.env %ENV_FILE% >&2
    exit /b 1
)

docker run --rm -i --env-file "%ENV_FILE%" victoury-mcp:stdio
```

Then in Claude config:
```json
{
  "mcpServers": {
    "victoury": {
      "command": "C:\\path\\to\\deployment\\docker-mcp-wrapper.bat",
      "args": ["production"]
    }
  }
}
```

## Alternative: Direct Node.js (No Docker)

If you prefer not to use Docker, you can run directly with Node.js:

```json
{
  "mcpServers": {
    "victoury": {
      "command": "node",
      "args": [
        "C:\\path\\to\\victoury-mcp-server\\dist\\index.js"
      ],
      "env": {
        "VICTOURY_API_URL": "https://api.victoury.com/v2",
        "VICTOURY_TENANT": "YOUR_TENANT_ID",
        "VICTOURY_SESSION_ID": "YOUR_SESSION_ID"
      }
    }
  }
}
```

## Troubleshooting

### 1. Check Docker is Running
```bash
docker --version
docker ps
```

### 2. Test MCP Server Manually
```bash
# Should output JSON-RPC messages
./docker-mcp-wrapper.sh production
```

### 3. Check Claude Logs
- Windows: `%APPDATA%\Claude\logs`
- macOS: `~/Library/Logs/Claude`
- Linux: `~/.config/Claude/logs`

### 4. Common Issues

**Permission Denied (Linux/macOS)**:
```bash
chmod +x deployment/docker-mcp-wrapper.sh
```

**Docker Not Found**:
- Ensure Docker Desktop is running
- Add Docker to PATH

**Environment File Not Found**:
```bash
cd deployment
cp envs/example.env envs/production.env
# Edit with your credentials
```

## Verifying It Works

1. Restart Claude Desktop after updating config
2. In a new conversation, you should see the MCP tools available
3. Try: "What Victoury tools are available?"
4. Claude should list the available tools like `list_products`, `create_booking`, etc.

## Security Notes

- Environment files (`.env`) contain sensitive credentials
- Never commit `.env` files to Git
- Use different credentials for dev/prod
- Consider using Docker secrets for production