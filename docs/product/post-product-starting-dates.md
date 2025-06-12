# POST Retrieve Product Starting Dates

Get available starting dates for a specific product.

## Endpoint
```
POST {{baseURL}}/{{version}}/products/startingdates.json
```

## Description
Retrieves all available starting dates for a product within a specified date range. Useful for showing calendar availability.

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Request Body Properties
- **productId** (required string/int) - The ID of the product
- **startDate** (optional string) - Start of date range in "YYYY-MM-DD" format
- **endDate** (optional string) - End of date range in "YYYY-MM-DD" format

## Response
Returns an array of available starting dates for the product.

## Notes
- Added in version 2022-07-20
- If no date range is specified, returns all available dates
- Useful for calendar/availability displays

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v2/products/startingdates.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "productId": "123",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
}'
```