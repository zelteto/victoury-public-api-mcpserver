#!/bin/bash
# Script to manage multiple client environments

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"

# Command
COMMAND=${1:-status}

case "$COMMAND" in
    status)
        echo -e "${BLUE}=== Victoury MCP Deployment Status ===${NC}\n"
        
        # Check each environment
        if [ -f "$DEPLOYMENT_DIR/configs/environments.yml" ]; then
            # Get all environment names
            ENVS=$(grep "^  [a-zA-Z]" "$DEPLOYMENT_DIR/configs/environments.yml" | sed 's/://g' | sed 's/^  //')
            
            for ENV in $ENVS; do
                CONTAINER_NAME="victoury-mcp-${ENV}-server"
                if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "$CONTAINER_NAME"; then
                    STATUS=$(docker ps --format "{{.Status}}" -f "name=$CONTAINER_NAME")
                    PORTS=$(docker ps --format "{{.Ports}}" -f "name=$CONTAINER_NAME")
                    echo -e "${GREEN}✓${NC} $ENV:"
                    echo -e "  Container: $CONTAINER_NAME"
                    echo -e "  Status: $STATUS"
                    echo -e "  Ports: $PORTS"
                else
                    echo -e "${RED}✗${NC} $ENV: Not running"
                fi
                echo ""
            done
        fi
        ;;
        
    start-all)
        echo -e "${BLUE}Starting all configured environments...${NC}\n"
        
        if [ -f "$DEPLOYMENT_DIR/configs/environments.yml" ]; then
            ENVS=$(grep "^  [a-zA-Z]" "$DEPLOYMENT_DIR/configs/environments.yml" | sed 's/://g' | sed 's/^  //')
            
            for ENV in $ENVS; do
                ENV_FILE="$DEPLOYMENT_DIR/envs/${ENV}.env"
                if [ -f "$ENV_FILE" ]; then
                    echo -e "${YELLOW}Starting $ENV...${NC}"
                    "$SCRIPT_DIR/deploy.sh" "$ENV"
                else
                    echo -e "${RED}Skipping $ENV: No env file found${NC}"
                fi
                echo ""
            done
        fi
        ;;
        
    stop-all)
        echo -e "${BLUE}Stopping all running environments...${NC}\n"
        
        # Stop all containers matching pattern
        CONTAINERS=$(docker ps -a --format "{{.Names}}" | grep "^victoury-mcp-.*-server$" || true)
        
        if [ -z "$CONTAINERS" ]; then
            echo "No running containers found"
        else
            for CONTAINER in $CONTAINERS; do
                echo -e "${YELLOW}Stopping $CONTAINER...${NC}"
                docker stop "$CONTAINER"
                docker rm "$CONTAINER"
            done
        fi
        ;;
        
    logs)
        ENV=${2:-}
        if [ -z "$ENV" ]; then
            echo "Usage: $0 logs <environment>"
            echo "Example: $0 logs client-a-dev"
            exit 1
        fi
        
        docker logs -f "victoury-mcp-${ENV}-server"
        ;;
        
    *)
        echo "Usage: $0 {status|start-all|stop-all|logs <env>}"
        echo ""
        echo "Commands:"
        echo "  status     - Show status of all environments"
        echo "  start-all  - Start all configured environments"
        echo "  stop-all   - Stop all running environments"
        echo "  logs <env> - Show logs for specific environment"
        echo ""
        echo "Examples:"
        echo "  $0 status"
        echo "  $0 logs client-a-dev"
        ;;
esac