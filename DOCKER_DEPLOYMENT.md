# Docker Deployment Quick Start

This project includes a complete Docker deployment setup in the `deployment/` directory.

## Quick Start

1. **Navigate to deployment directory:**
   ```bash
   cd deployment
   ```

2. **Run initial setup:**
   ```bash
   ./scripts/setup.sh
   ```

3. **Configure your environment:**
   ```bash
   # Edit the production environment file
   nano envs/production.env
   ```

4. **Deploy:**
   ```bash
   ./scripts/deploy.sh production
   ```

## Key Features

- **Local Docker builds** - No Docker Hub dependency
- **Complete secrets separation** - All secrets in git-ignored env files
- **Multi-environment support** - Development, staging, and production
- **Easy management scripts** - Deploy, stop, and view logs with simple commands
- **Production-ready** - Health checks, resource limits, and proper signal handling

## Available Commands

```bash
# Deploy to an environment
./scripts/deploy.sh <environment>

# Stop an environment
./scripts/stop.sh <environment>

# View logs
docker compose -p victoury-mcp-<environment> logs -f
```

For full documentation, see `deployment/README.md`