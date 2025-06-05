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

# Default values
ENVIRONMENT=""
STOP_ALL=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            STOP_ALL=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [<environment>] [options]"
            echo ""
            echo "Arguments:"
            echo "  <environment>    Environment to stop (development, staging, production)"
            echo ""
            echo "Options:"
            echo "  --all           Stop all environments"
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

# Validate arguments
if [ "$STOP_ALL" = false ] && [ -z "$ENVIRONMENT" ]; then
    echo -e "${RED}Error: Environment not specified${NC}"
    echo "Usage: $0 <environment> or $0 --all"
    exit 1
fi

cd "$DEPLOYMENT_DIR"

# Function to stop a single environment
stop_environment() {
    local env=$1
    local project_name="victoury-mcp-${env}"
    
    echo -e "${YELLOW}Checking ${env} environment...${NC}"
    
    if docker compose -p "$project_name" ps --quiet 2>/dev/null | grep -q .; then
        echo -e "Stopping ${env} deployment..."
        docker compose -p "$project_name" down
        echo -e "${GREEN}✓ ${env} deployment stopped${NC}"
    else
        echo -e "${BLUE}✓ ${env} deployment is not running${NC}"
    fi
}

# Main logic
if [ "$STOP_ALL" = true ]; then
    echo -e "${BLUE}Stopping all Victoury MCP Server deployments${NC}"
    echo "============================================="
    
    # Stop all known environments
    for env in development staging production; do
        stop_environment "$env"
        echo ""
    done
    
    # Clean up any dangling containers/networks
    echo -e "${YELLOW}Cleaning up dangling resources...${NC}"
    docker network prune -f --filter "label=com.docker.compose.project=victoury-mcp-*" 2>/dev/null || true
    echo -e "${GREEN}✓ Cleanup complete${NC}"
    
else
    echo -e "${BLUE}Stopping Victoury MCP Server - ${ENVIRONMENT}${NC}"
    echo "==========================================="
    
    # Check if environment file exists (warning only)
    ENV_FILE="$DEPLOYMENT_DIR/envs/${ENVIRONMENT}.env"
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}Warning: Environment file not found: $ENV_FILE${NC}"
    fi
    
    stop_environment "$ENVIRONMENT"
fi

echo -e "\n${GREEN}Operation complete!${NC}"