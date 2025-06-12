# POST Create Option/Booking

Create a new option or booking for a deal.

## Endpoint
```
POST {{baseURL}}/{{version}}/deals/createoptionbooking.json
```

## Description
Creates a new option (hold) or booking for a product. An option allows temporarily reserving a product before final confirmation.

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Request Body Properties
- **type** (required string) - "O" for Option, "B" for Booking
- **productId** (required string/int) - The ID of the product
- **startDate** (required string) - Start date in "YYYY-MM-DD" format
- **endDate** (required string) - End date in "YYYY-MM-DD" format
- **numberOfTravelers** (required int) - Number of travelers
- **mainTraveler** (required object) - Main traveler information
- **optionExpiryDate** (optional string) - Expiry date for options
- **notes** (optional string) - Additional notes

## Response
Returns the created option/booking details including:
- Deal ID/UUID
- Booking reference
- Status
- Payment information (creates entry in Customer Payments)

## Notes
- Added in version 2024-10-04
- When created, an entry is automatically added to Customer Payments
- Options can be converted to bookings later
- Options have expiry dates after which they are automatically released

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v2/deals/createoptionbooking.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "type": "O",
    "productId": "123",
    "startDate": "2024-07-01",
    "endDate": "2024-07-08",
    "numberOfTravelers": 2,
    "mainTraveler": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
    },
    "optionExpiryDate": "2024-06-01"
}'
```