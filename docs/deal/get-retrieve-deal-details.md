# GET Retrieve Deal Details

Retrieve detailed information about a specific deal.

## Endpoint
```
GET {{baseURL}}/{{version}}/deals/{{dealUuid}}.json
```

## Description
Returns comprehensive details of a deal identified by its UUID. This includes:
- Deal information (dates, status, pricing)
- Customer information
- Traveler details
- Arrangements
- Custom fields (as of 2024-12-11)
- Person-Customer addresses for travelers (as of 2024-12-11)

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Path Parameters
- **dealUuid** - The unique identifier (UUID) of the deal

## Response
Returns a detailed deal object including:
- Basic deal information
- Customer and billing details
- Traveler information with custom fields
- Trip and arrangement details
- Invoice information (returns the most recent customer invoice that is not credited as of 2023-02-01)

## Notes
- The UUID can be obtained from the "List All Main Traveler Deals" endpoint
- Returns 404 if the deal UUID is not found
- Includes labels for all arrangement information containing choicelist codes (as of 2022-10-11)

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v2/deals/62454f5113424008888b1c2c.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'
```