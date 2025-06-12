# PATCH Update Person

Update person/traveler information.

## Endpoint
```
PATCH {{baseURL}}/{{version}}/persons/{{personId}}.json
```

## Description
Updates specific fields of a person/traveler record. Only the fields provided in the request body will be updated.

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Path Parameters
- **personId** - The ID of the person to update

## Request Body
Only include the fields you want to update. Possible fields include:
- Personal information (name, birthdate, etc.)
- Contact information (email, phone)
- Passport details
- Language preferences
- Custom fields
- Address information

## Response
Returns the updated person object.

## Notes
- Added in version 2022-11-04
- Changed from PUT to PATCH method as of 2022-11-09
- Only fields included in the request body will be updated
- Returns 404 if the person ID is not found

## Example Request
```bash
curl --location --request PATCH 'https://api.acceptation-victoury.eu/v2/persons/123.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "email": "newemail@example.com",
    "phoneNumber": "+1234567890"
}'
```