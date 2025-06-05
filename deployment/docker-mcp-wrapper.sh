#!/bin/bash
# Wrapper script for running MCP server in Docker for Claude Desktop

# Get the environment name from first argument or default
ENV_NAME=${1:-production}

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$SCRIPT_DIR/envs/${ENV_NAME}.env"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file not found: $ENV_FILE" >&2
    echo "Please create it from the example:" >&2
    echo "  cp $SCRIPT_DIR/envs/example.env $ENV_FILE" >&2
    exit 1
fi

# Run Docker container with stdio
exec docker run \
    --rm \
    -i \
    --env-file "$ENV_FILE" \
    --name "victoury-mcp-stdio-$$" \
    victoury-mcp:stdio