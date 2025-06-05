#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}Victoury MCP Server - Initial Setup${NC}"
echo "======================================"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose v2 is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Create necessary directories
echo -e "\n${YELLOW}Creating directory structure...${NC}"
cd "$DEPLOYMENT_DIR"

# Ensure envs directory exists
if [ ! -d "envs" ]; then
    mkdir -p envs
    echo -e "${GREEN}✓ Created envs directory${NC}"
fi

# Check if example.env exists
if [ ! -f "envs/example.env" ]; then
    echo -e "${RED}Error: envs/example.env not found${NC}"
    echo "Creating from template..."
    # This will be created by the next file
fi

# Make scripts executable
echo -e "\n${YELLOW}Setting script permissions...${NC}"
chmod +x scripts/*.sh
echo -e "${GREEN}✓ Scripts are now executable${NC}"

# Create default environments if they don't exist
echo -e "\n${YELLOW}Setting up default environments...${NC}"

for env in development staging production; do
    if [ ! -f "envs/${env}.env" ]; then
        echo -e "Creating ${env}.env from example..."
        cp envs/example.env "envs/${env}.env"
        echo -e "${GREEN}✓ Created envs/${env}.env${NC}"
        echo -e "${YELLOW}  Please edit this file with your actual credentials${NC}"
    else
        echo -e "${GREEN}✓ envs/${env}.env already exists${NC}"
    fi
done

# Build Docker image
echo -e "\n${YELLOW}Building Docker image...${NC}"
cd "$DEPLOYMENT_DIR/.."
docker build -f deployment/Dockerfile -t victoury-mcp-server:latest .
echo -e "${GREEN}✓ Docker image built successfully${NC}"

# Setup complete
echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "\nNext steps:"
echo -e "1. Edit environment files in ${DEPLOYMENT_DIR}/envs/"
echo -e "2. Run: ${SCRIPT_DIR}/deploy.sh <environment>"
echo -e "\nExample:"
echo -e "  ${SCRIPT_DIR}/deploy.sh development"