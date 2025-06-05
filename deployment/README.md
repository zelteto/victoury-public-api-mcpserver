# Victoury MCP Server Docker Deployment

This directory contains everything needed to deploy the Victoury MCP Server using Docker.

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Git (for cloning the repository)
- Bash shell (for running deployment scripts)

## Quick Start

1. **Initial Setup**
   ```bash
   cd deployment
   ./scripts/setup.sh
   ```

2. **Configure Environment**
   ```bash
   # Copy example environment file
   cp envs/example.env envs/production.env
   
   # Edit with your actual credentials
   nano envs/production.env
   ```

3. **Deploy**
   ```bash
   ./scripts/deploy.sh production
   ```

## Directory Structure

```
deployment/
├── README.md              # This file
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Multi-stage Docker build
├── .gitignore           # Git ignore for secrets
├── scripts/             # Deployment scripts
│   ├── setup.sh        # Initial setup script
│   ├── deploy.sh       # Deployment script
│   └── stop.sh         # Stop/cleanup script
├── envs/               # Environment files (git-ignored)
│   └── example.env     # Example configuration
└── configs/            # Configuration files
    └── environments.yml # Environment definitions
```

## Environment Management

### Creating New Environments

1. Copy the example environment file:
   ```bash
   cp envs/example.env envs/staging.env
   ```

2. Update the environment variables in the new file

3. Add the environment to `configs/environments.yml`

4. Deploy to the new environment:
   ```bash
   ./scripts/deploy.sh staging
   ```

### Available Environments

- `development` - Local development
- `staging` - Staging server
- `production` - Production server

## Deployment Commands

### Deploy/Update
```bash
# Deploy to specific environment
./scripts/deploy.sh production

# Deploy with rebuild
./scripts/deploy.sh production --rebuild

# Deploy with specific tag
./scripts/deploy.sh production --tag v1.2.3
```

### Stop Services
```bash
# Stop specific environment
./scripts/stop.sh production

# Stop all environments
./scripts/stop.sh --all
```

### View Logs
```bash
# View logs for production
docker compose -p victoury-mcp-production logs -f

# View last 100 lines
docker compose -p victoury-mcp-production logs --tail 100
```

### Shell Access
```bash
# Access production container
docker exec -it victoury-mcp-production-server-1 /bin/sh
```

## Security Notes

1. **Never commit `.env` files** - All environment files in `envs/` are git-ignored
2. **Use strong API credentials** - Generate secure API keys and secrets
3. **Limit port exposure** - Only expose necessary ports in docker-compose.yml
4. **Regular updates** - Keep Docker images and dependencies updated

## Backup and Recovery

### Backup Configuration
```bash
# Backup all environment files
tar -czf envs-backup-$(date +%Y%m%d).tar.gz envs/
```

### Restore Configuration
```bash
# Restore from backup
tar -xzf envs-backup-20240105.tar.gz
```

## Troubleshooting

### Container Won't Start
1. Check logs: `docker compose -p victoury-mcp-<env> logs`
2. Verify environment file exists and is valid
3. Ensure ports are not already in use

### Connection Issues
1. Verify API credentials in environment file
2. Check network connectivity
3. Ensure firewall rules allow outbound HTTPS

### Memory Issues
1. Increase Docker memory allocation
2. Check container resource usage: `docker stats`
3. Adjust Node.js memory limits in Dockerfile

## Production Checklist

- [ ] Strong API credentials configured
- [ ] Environment files secured with proper permissions
- [ ] Monitoring/alerting configured
- [ ] Backup strategy in place
- [ ] Update procedure documented
- [ ] Incident response plan created

## Support

For issues specific to:
- **Docker deployment**: Check this README and deployment scripts
- **MCP Server**: See main project README.md
- **Victoury API**: Consult Victoury documentation