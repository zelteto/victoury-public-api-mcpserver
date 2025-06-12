# GET Retrieve Document

Retrieve documents related to deals, bookings, or invoices.

## Endpoint
```
GET {{baseURL}}/{{version}}/documents/{{documentId}}.{{format}}
```

Or without version (as of 2024-10-04):
```
GET {{baseURL}}/documents/{{documentId}}.{{format}}
```

## Description
Retrieves various types of documents including invoices, vouchers, tickets, and confirmations.

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Path Parameters
- **documentId** - The ID of the document to retrieve
- **format** - Document format (pdf, html, json)

## Query Parameters
- **type** (optional) - Document type filter (invoice, voucher, ticket, etc.)

## Response
Returns the document in the requested format:
- **PDF**: Binary PDF file
- **HTML**: HTML representation
- **JSON**: Document metadata and content

## Notes
- As of 2024-10-04, documents can be accessed without version number in URL
- Different document types may have different available formats
- Access permissions depend on the deal/booking ownership

## Example Request
```bash
# With version
curl --location 'https://api.acceptation-victoury.eu/v2/documents/123.pdf' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'

# Without version (newer)
curl --location 'https://api.acceptation-victoury.eu/documents/123.pdf' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'
```