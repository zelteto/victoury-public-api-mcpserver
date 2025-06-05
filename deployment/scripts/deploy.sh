#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DEPLOYMENT_DIR")"

# Default values
ENVIRONMENT=""
REBUILD=false
TAG="latest"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --rebuild)
            REBUILD=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 <environment> [options]"
            echo ""
            echo "Arguments:"
            echo "  <environment>    Environment to deploy (development, staging, production)"
            echo ""
            echo "Options:"
            echo "  --rebuild       Force rebuild of Docker image"
            echo "  --tag <tag>     Use specific image tag (default: latest)"
            echo "  --help, -h      Show this help message"
            exit 0
            ;;
        *)
            if [ -z "$ENVIRONMENT" ]; then
                ENVIRONMENT="$1"
            else
                echo -e "${RED}Error: Unknown argument: $1${NC}"
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate environment
if [ -z "$ENVIRONMENT" ]; then
    echo -e "${RED}Error: Environment not specified${NC}"
    echo "Usage: $0 <environment> [options]"
    echo "Available environments: development, staging, production"
    exit 1
fi

# Check if environment file exists
ENV_FILE="$DEPLOYMENT_DIR/envs/${ENVIRONMENT}.env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: Environment file not found: $ENV_FILE${NC}"
    echo "Please create it from the example:"
    echo "  cp $DEPLOYMENT_DIR/envs/example.env $ENV_FILE"
    exit 1
fi

echo -e "${BLUE}Deploying Victoury MCP Server - ${ENVIRONMENT}${NC}"
echo "================================================"

# Load environment variables
set -a
source "$ENV_FILE"
set +a

# Export additional variables for docker-compose
export ENVIRONMENT
export TAG

# Load environment-specific settings from environments.yml if it exists
ENV_CONFIG_FILE="$DEPLOYMENT_DIR/configs/environments.yml"
if [ -f "$ENV_CONFIG_FILE" ]; then
    # Extract port and other settings for this environment
    # Using grep and sed for simple parsing (no external dependencies)
    PORT=$(grep -A 5 "^  $ENVIRONMENT:" "$ENV_CONFIG_FILE" | grep "port:" | sed 's/.*port: *//')
    if [ ! -z "$PORT" ]; then
        export HOST_PORT="$PORT"
        echo -e "${BLUE}Using port $PORT from environments.yml${NC}"
    fi
    
    # Extract any other environment-specific settings
    BUILD_NODE_ENV=$(grep -A 10 "^  $ENVIRONMENT:" "$ENV_CONFIG_FILE" | grep "NODE_ENV:" | sed 's/.*NODE_ENV: *//')
    if [ ! -z "$BUILD_NODE_ENV" ]; then
        export NODE_ENV="$BUILD_NODE_ENV"
    fi
fi

# Validate required environment variables
REQUIRED_VARS=("VICTOURY_API_URL" "VICTOURY_API_KEY" "VICTOURY_API_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}Error: Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo -e "\nPlease update: $ENV_FILE"
    exit 1
fi

# Change to deployment directory
cd "$DEPLOYMENT_DIR"

# Build image if requested or if it doesn't exist
if [ "$REBUILD" = true ] || ! docker image inspect "victoury-mcp-server:$TAG" >/dev/null 2>&1; then
    echo -e "\n${YELLOW}Building Docker image...${NC}"
    cd "$PROJECT_ROOT"
    docker build -f deployment/Dockerfile -t "victoury-mcp-server:$TAG" .
    echo -e "${GREEN}✓ Docker image built${NC}"
    cd "$DEPLOYMENT_DIR"
fi

# Stop existing deployment if running
PROJECT_NAME="victoury-mcp-${ENVIRONMENT}"
if docker compose -p "$PROJECT_NAME" ps --quiet 2>/dev/null | grep -q .; then
    echo -e "\n${YELLOW}Stopping existing deployment...${NC}"
    docker compose -p "$PROJECT_NAME" down
    echo -e "${GREEN}✓ Existing deployment stopped${NC}"
fi

# Deploy
echo -e "\n${YELLOW}Starting deployment...${NC}"
docker compose -p "$PROJECT_NAME" up -d

# Wait for health check
echo -e "\n${YELLOW}Waiting for service to be healthy...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker compose -p "$PROJECT_NAME" ps | grep -q "healthy"; then
        echo -e "${GREEN}✓ Service is healthy${NC}"
        break
    elif docker compose -p "$PROJECT_NAME" ps | grep -q "unhealthy"; then
        echo -e "${RED}✗ Service is unhealthy${NC}"
        echo -e "\nChecking logs..."
        docker compose -p "$PROJECT_NAME" logs --tail 50
        exit 1
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "\n${RED}✗ Service failed to become healthy${NC}"
    echo -e "\nChecking logs..."
    docker compose -p "$PROJECT_NAME" logs --tail 50
    exit 1
fi

# Show deployment info
echo -e "\n${GREEN}Deployment successful!${NC}"
echo -e "\nDeployment Information:"
echo -e "  Environment: ${BLUE}${ENVIRONMENT}${NC}"
echo -e "  Project: ${BLUE}${PROJECT_NAME}${NC}"
echo -e "  Image Tag: ${BLUE}${TAG}${NC}"
echo -e "  API URL: ${BLUE}${VICTOURY_API_URL}${NC}"
echo -e "  MCP Port: ${BLUE}${HOST_PORT:-3000}${NC}"

echo -e "\nUseful commands:"
echo -e "  View logs:    docker compose -p $PROJECT_NAME logs -f"
echo -e "  Stop:         $SCRIPT_DIR/stop.sh $ENVIRONMENT"
echo -e "  Shell access: docker exec -it ${PROJECT_NAME}-server-1 /bin/sh"