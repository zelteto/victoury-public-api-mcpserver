# GET Retrieve API Health

Check API health status and service availability.

## Endpoint
```
GET /health
```

Note: This endpoint does not require the version number in the URL.

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
curl --location 'https://api.acceptation-victoury.eu/health' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'
```