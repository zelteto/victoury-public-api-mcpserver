# GET Retrieve API Health

Check API health status and service availability.

## Endpoint
```
GET /health
```

**Important**: This endpoint is outside of API versioning. Do not include the version number in the URL.

For example:
- ✅ Correct: `https://api.acceptation-victoury.net/health`
- ❌ Incorrect: `https://api.acceptation-victoury.net/v2/health`

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Response
Returns the health status of the API and its various components.

## Example Request
```bash
# Note: No /v2 in the URL - this endpoint is outside versioning
curl --location 'https://api.acceptation-victoury.eu/health' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'
```