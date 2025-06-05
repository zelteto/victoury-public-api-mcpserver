# How Environment Configuration Works

## The Complete Flow

### 1. Environment Definition (configs/environments.yml)
```yaml
environments:
  client-a:
    port: 3010              # External port for this environment
    build_args:
      NODE_ENV: production  # Build-time variable
```

### 2. Credentials File (envs/client-a.env)
```bash
# API Credentials (secret, not in git)
VICTOURY_API_URL=https://api.client-a.victoury.com/v2
VICTOURY_TENANT=CLIENT_A_TENANT_123
VICTOURY_SESSION_ID=CLIENT_A_SESSION_456

# Optional overrides
LOG_LEVEL=debug
```

### 3. Deploy Command
```bash
./scripts/deploy.sh client-a
```

### 4. What Happens:

```
deploy.sh client-a
    │
    ├─► Reads environments.yml
    │   └─► Gets: port=3010, NODE_ENV=production
    │
    ├─► Loads envs/client-a.env
    │   └─► Gets: API URL, Tenant, Session ID
    │
    └─► Runs Docker with:
        ├─► Port: 3010 (from yml)
        ├─► NODE_ENV: production (from yml)
        └─► API credentials (from env)
```

## Complete Example: Multiple Clients

### Directory Structure:
```
deployment/
├── configs/
│   └── environments.yml    # Defines all environments
├── envs/
│   ├── example.env        # Template (in git)
│   ├── client-a.env       # Client A secrets (not in git)
│   ├── client-b.env       # Client B secrets (not in git)
│   └── staging.env        # Staging secrets (not in git)
```

### environments.yml:
```yaml
environments:
  client-a:
    port: 3010
    description: "Client A Production"
    
  client-b:
    port: 3011
    description: "Client B Production"
    
  staging:
    port: 3001
    description: "Shared Staging Environment"
```

### Running Multiple Environments:
```bash
# Deploy Client A on port 3010
./scripts/deploy.sh client-a

# Deploy Client B on port 3011
./scripts/deploy.sh client-b

# Deploy Staging on port 3001
./scripts/deploy.sh staging

# All running simultaneously:
docker ps
# victoury-mcp-client-a-server    0.0.0.0:3010->3000/tcp
# victoury-mcp-client-b-server    0.0.0.0:3011->3000/tcp
# victoury-mcp-staging-server     0.0.0.0:3001->3000/tcp
```

## Adding a New Client

### 1. Add to environments.yml:
```yaml
environments:
  client-c:
    port: 3012
    description: "Client C Production"
```

### 2. Create credentials file:
```bash
cp envs/example.env envs/client-c.env
# Edit envs/client-c.env with Client C credentials
```

### 3. Deploy:
```bash
./scripts/deploy.sh client-c
```

## Key Points:

1. **Environment Name** = Links everything together
   - `client-a` in deploy command
   - `client-a:` section in environments.yml
   - `client-a.env` file in envs/

2. **Separation of Concerns**:
   - `environments.yml` = Public configuration (ports, build args)
   - `envs/*.env` = Secret credentials (API keys, URLs)

3. **Docker Container Names**:
   - Pattern: `victoury-mcp-{environment}-server`
   - Example: `victoury-mcp-client-a-server`

4. **Network Isolation**:
   - Each environment gets its own network
   - Pattern: `victoury-mcp-{environment}`

## Advanced: Python Script for Better YAML Parsing

If you want more advanced YAML parsing, create `scripts/deploy-advanced.py`:

```python
#!/usr/bin/env python3
import yaml
import os
import sys
import subprocess

def load_environment_config(env_name):
    with open('configs/environments.yml', 'r') as f:
        config = yaml.safe_load(f)
    
    if env_name not in config['environments']:
        print(f"Error: Environment '{env_name}' not found in environments.yml")
        sys.exit(1)
    
    return config['environments'][env_name]

def deploy(env_name):
    # Load config
    env_config = load_environment_config(env_name)
    
    # Set environment variables
    os.environ['ENVIRONMENT'] = env_name
    os.environ['HOST_PORT'] = str(env_config.get('port', 3000))
    
    # Load any build args
    for key, value in env_config.get('build_args', {}).items():
        os.environ[key] = str(value)
    
    # Run docker-compose
    subprocess.run([
        'docker-compose',
        '-p', f'victoury-mcp-{env_name}',
        'up', '-d'
    ])

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: deploy-advanced.py <environment>")
        sys.exit(1)
    
    deploy(sys.argv[1])
```