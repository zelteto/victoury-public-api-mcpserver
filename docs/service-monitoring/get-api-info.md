# GET Retrieve API Info

Retrieves API version and environment information.

## Endpoint
```
GET /info
```

Note: This endpoint does not require the version number in the URL.

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
curl --location 'https://api.acceptation-victoury.eu/info' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'
```