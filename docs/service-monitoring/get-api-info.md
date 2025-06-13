# GET Retrieve API Info

Retrieves API version and environment information.

## Endpoint
```
GET /info
```

**Important**: This endpoint is outside of API versioning. Do not include the version number in the URL.

For example:
- ✅ Correct: `https://api.acceptation-victoury.net/info`
- ❌ Incorrect: `https://api.acceptation-victoury.net/v2/info`

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Response
Returns information about the API version, environment, and configuration.

## Example Request
```bash
# Note: No /v2 in the URL - this endpoint is outside versioning
curl --location 'https://api.acceptation-victoury.eu/info' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'
```