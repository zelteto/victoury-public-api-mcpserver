# PATCH Update Deal

Update an existing deal with new information.

## Endpoint
```
PATCH {{baseURL}}/{{version}}/deals/{{dealId}}.json
```

## Description
Updates specific fields of an existing deal. Only the fields provided in the request body will be updated; all other fields remain unchanged.

As of 2024-12-11, this endpoint supports updating:
- Person related custom fields
- Person-Customer address for travelers

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Path Parameters
- **dealId** - The ID of the deal to update

## Request Body
Only include the fields you want to update. Possible fields include:
- Customer information
- Traveler details
- Custom field values
- Person-Customer addresses
- Other deal-specific fields

## Response
Returns the updated deal object.

## Notes
- Changed from POST to PATCH method as of 2022-11-09
- Only fields included in the request body will be updated
- Returns 404 if the deal ID is not found

## Example Request
```bash
curl --location --request PATCH 'https://api.acceptation-victoury.eu/v2/deals/123.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "customFieldValues": {
        "fieldName": "newValue"
    }
}'
```