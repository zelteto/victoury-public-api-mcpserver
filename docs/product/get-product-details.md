# GET Retrieve Product Details

Get detailed information about a specific product.

## Endpoint
```
GET {{baseURL}}/{{version}}/products/{{productId}}.json
```

## Description
Retrieves comprehensive details about a specific product including pricing, availability, and configuration.

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Path Parameters
- **productId** - The ID of the product to retrieve

## Response
Returns detailed product information including:
- Product name and description
- Category and type
- Pricing information
- Availability details
- Configuration options
- Related products

## Notes
- Added in version 2022-07-20
- Returns 404 if the product ID is not found

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v2/products/123.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'
```