# PATCH Update Address

Update address information.

## Endpoint
```
PATCH {{baseURL}}/{{version}}/addresses/{{addressId}}.json
```

## Description
Updates specific fields of an address record. Only the fields provided in the request body will be updated.

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Path Parameters
- **addressId** - The ID of the address to update

## Request Body
Only include the fields you want to update. Possible fields include:
- **street** (string) - Street address
- **city** (string) - City name
- **state** (string) - State/Province
- **postalCode** (string) - Postal/ZIP code
- **country** (string) - Country code
- **phoneNumber** (string) - Contact phone number
- Additional address fields as needed

## Response
Returns the updated address object.

## Notes
- Added in version 2022-11-10
- Only fields included in the request body will be updated
- Returns 404 if the address ID is not found

## Example Request
```bash
curl --location --request PATCH 'https://api.acceptation-victoury.eu/v2/addresses/123.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "street": "123 New Street",
    "city": "New City",
    "postalCode": "12345"
}'
```