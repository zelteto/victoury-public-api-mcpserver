# POST Register Customer Payment

Register a customer payment for a deal or option.

## Endpoint
```
POST {{baseURL}}/{{version}}/customerpayments/{{customerPaymentId}}/registercustomerpayment.json
```

## Description
In Victoury when a Deal or an Option is created, an entry for payment is created in Customer Payments with the information regarding the amounts that needs to be paid by the customer. This endpoint allows registering actual customer payments against these entries.

## Headers
```
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Path Parameters
- **customerPaymentId** - The ID of the customer payment entry to register payment against

## Request Body Properties
- **amountPaid** (mandatory double) - The amount paid by the customer
- **datePaid** (optional string) - Payment date in "YYYY-MM-DD" format
- **paymentType** (mandatory string) - Type of payment (e.g., "BANK")
- **paymentReference** (optional string) - Reference for the payment
- **accountNumber** (optional string) - Account number used for payment

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v3/customerpayments/21/registercustomerpayment.json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "amountPaid": 100,
    "datePaid": "2023-08-01",
    "paymentType": "BANK",
    "paymentReference": "Payment 1",
    "accountNumber": null
}'
```

## Example Response (200 OK)
```json
{
  "code": 0,
  "message": "CustomerPayment register successfully!",
  "messageId": null,
  "id": 21
}
```

## Notes
- The endpoint URL uses v3 instead of v2
- The payment is registered against an existing customer payment entry created when a deal or option is created