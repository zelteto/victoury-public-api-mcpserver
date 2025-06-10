# Installing Victoury MCP Server from Git into Claude Desktop

## Prerequisites
- Git installed
- Node.js 18+ installed
- Claude Desktop installed
- Docker Desktop (optional, for Docker method)

## Method 1: Direct Node.js Installation

### Step 1: Clone the Repository
```bash
# Clone the repository
git clone https://github.com/zelteto/victoury-public-api-mcpserver.git
cd victoury-public-api-mcpserver
```

### Step 2: Install Dependencies and Build
```bash
# Install dependencies
npm install

# Build the TypeScript files
npm run build
```

### Step 3: Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit with your Victoury API credentials
# Use your favorite editor (nano, vim, notepad, etc.)
nano .env
```

Add your credentials to `.env`:
```env
VICTOURY_API_URL=https://api.victoury.com/v2
VICTOURY_API_KEY=your_tenant_id_here
VICTOURY_API_SECRET=your_session_id_here
VICTOURY_API_TIMEOUT=30000
```

### Step 4: Configure Claude Desktop

Find your Claude Desktop config file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Add the MCP server configuration:

**Windows Example:**
```json
{
  "mcpServers": {
    "victoury": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\victoury-public-api-mcpserver\\dist\\index.js"],
      "env": {
        "VICTOURY_API_URL": "https://api.victoury.com/v2",
        "VICTOURY_API_KEY": "your_tenant_id",
        "VICTOURY_API_SECRET": "your_session_id"
      }
    }
  }
}
```

**macOS/Linux Example:**
```json
{
  "mcpServers": {
    "victoury": {
      "command": "node",
      "args": ["/home/username/victoury-public-api-mcpserver/dist/index.js"],
      "env": {
        "VICTOURY_API_URL": "https://api.victoury.com/v2",
        "VICTOURY_API_KEY": "your_tenant_id",
        "VICTOURY_API_SECRET": "your_session_id"
      }
    }
  }
}
```

### Step 5: Restart Claude Desktop
1. Completely quit Claude Desktop
2. Start Claude Desktop again
3. The Victoury MCP tools should now be available

## Method 2: Docker Installation (Recommended)

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone https://github.com/zelteto/victoury-public-api-mcpserver.git
cd victoury-public-api-mcpserver

# Run the setup script
./setup-claude-desktop.sh
```

### Step 2: Configure Credentials
```bash
# Edit the production environment file
nano deployment/envs/production.env
```

Add your credentials:
```env
VICTOURY_API_URL=https://api.victoury.com/v2
VICTOURY_TENANT=your_tenant_id
VICTOURY_SESSION_ID=your_session_id
LOG_LEVEL=info
```

### Step 3: Test the Setup
```bash
cd deployment
./docker-mcp-wrapper.sh production
# You should see MCP protocol output
# Press Ctrl+C to exit
```

### Step 4: Configure Claude Desktop

The setup script will show you the exact configuration to add. It will look like:

```json
{
  "mcpServers": {
    "victoury": {
      "command": "/full/path/to/deployment/docker-mcp-wrapper.sh",
      "args": ["production"]
    }
  }
}
```

### Step 5: Restart Claude Desktop

## Method 3: Quick Install Script

### For macOS/Linux:
```bash
#!/bin/bash
# Save this as install-victoury-mcp.sh

# Clone repo
git clone https://github.com/zelteto/victoury-public-api-mcpserver.git
cd victoury-public-api-mcpserver

# Install and build
npm install
npm run build

# Create env file
cat > .env << EOF
VICTOURY_API_URL=https://api.victoury.com/v2
VICTOURY_API_KEY=your_tenant_id
VICTOURY_API_SECRET=your_session_id
EOF

echo "Edit .env with your credentials, then add to Claude config:"
echo "{"
echo "  \"mcpServers\": {"
echo "    \"victoury\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"$(pwd)/dist/index.js\"]"
echo "    }"
echo "  }"
echo "}"
```

### For Windows (PowerShell):
```powershell
# Clone repo
git clone https://github.com/zelteto/victoury-public-api-mcpserver.git
cd victoury-public-api-mcpserver

# Install and build
npm install
npm run build

# Create env file
@"
VICTOURY_API_URL=https://api.victoury.com/v2
VICTOURY_API_KEY=your_tenant_id
VICTOURY_API_SECRET=your_session_id
"@ | Out-File -FilePath .env -Encoding UTF8

Write-Host "Edit .env with your credentials"
Write-Host "Then add to %APPDATA%\Claude\claude_desktop_config.json:"
Write-Host @"
{
  "mcpServers": {
    "victoury": {
      "command": "node",
      "args": ["$((Get-Location).Path)\dist\index.js"]
    }
  }
}
"@
```

## Verification

### 1. Check Installation
After restarting Claude Desktop, in a new conversation, ask:
- "What Victoury tools are available?"
- "Can you list the MCP tools you have access to?"

### 2. Test a Tool
Try a simple command:
- "Get the Victoury API info"
- "List available products with a limit of 5"

### 3. Check Logs
If tools aren't showing:

**Windows:**
```
%APPDATA%\Claude\logs\
```

**macOS:**
```
~/Library/Logs/Claude/
```

**Linux:**
```
~/.config/Claude/logs/
```

## Troubleshooting

### Tools Not Showing
1. Verify the path in config is absolute and correct
2. Check if Node.js is in PATH: `node --version`
3. Test the server manually: `node /path/to/dist/index.js`

### Permission Errors (macOS/Linux)
```bash
chmod +x setup-claude-desktop.sh
chmod +x deployment/docker-mcp-wrapper.sh
```

### Build Errors
```bash
# Clear and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Docker Issues
```bash
# Ensure Docker is running
docker --version
docker ps

# Rebuild image
cd deployment
docker build -f Dockerfile.mcp -t victoury-mcp:stdio ..
```

## Multiple Environments

To use multiple environments (dev, staging, prod):

```json
{
  "mcpServers": {
    "victoury-prod": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "VICTOURY_API_URL": "https://api.victoury.com/v2",
        "VICTOURY_API_KEY": "prod_tenant_id",
        "VICTOURY_API_SECRET": "prod_session_id"
      }
    },
    "victoury-dev": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "VICTOURY_API_URL": "https://api.dev.victoury.com/v2",
        "VICTOURY_API_KEY": "dev_tenant_id",
        "VICTOURY_API_SECRET": "dev_session_id"
      }
    }
  }
}
```

## Updates

To update to the latest version:

```bash
cd victoury-public-api-mcpserver
git pull
npm install
npm run build
# Restart Claude Desktop
```