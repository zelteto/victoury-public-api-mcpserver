# POST Retrieve Product Package Price Availability

Check package pricing and availability for a product.

## Endpoint
```
POST {{baseURL}}/{{version}}/products/packagepriceavailability.json
```

## Description
Retrieves comprehensive package pricing and availability information for a product, including all components and options.

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Request Body Properties
- **productId** (required string/int) - The ID of the product
- **packageId** (required string/int) - The ID of the package
- **startDate** (required string) - Start date in "YYYY-MM-DD" format
- **endDate** (optional string) - End date in "YYYY-MM-DD" format
- **numberOfTravelers** (required int) - Number of travelers

## Response
Returns package availability and pricing including:
- Package components and their individual prices
- Total package price
- Availability status
- Included services
- Optional add-ons
- Tax information

## Notes
- Added in version 2022-07-20
- Useful for complex package products with multiple components
- Prices include all mandatory package components

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v2/products/packagepriceavailability.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "productId": "123",
    "packageId": "456",
    "startDate": "2024-06-15",
    "endDate": "2024-06-22",
    "numberOfTravelers": 2
}'
```