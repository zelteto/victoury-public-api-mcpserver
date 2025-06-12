# Victoury Public API v2 - Overview

## Introduction

The Victoury Public API is organized around REST.

It has predictable resource-oriented URLs, returns JSON-encoded responses, and uses standard HTTP response codes and verbs.

All requests must be made over HTTPS.

## Base URLs

### Acceptation Environment
```
https://api.acceptation-victoury.net
```

### Production Environment
```
https://api.victoury.eu
```

## Authorization

Authorization for using the Victoury Public API methods is based on tenant code and API key. They will be provided for each consumer and need to be sent as headers.

- Tenant code must be provided in header **Tenant**
- API key must be provided in header **Session-Id**

### Required Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Error Handling

Victoury Public API uses conventional HTTP response codes to indicate the success or failure of an API request.

- Codes in the **2xx** range indicate success
- Codes in the **4xx** range indicate an error that failed given the information provided (e.g., invalid Session-Id, tenant not found, deal not found etc.)
- Codes in the **5xx** range indicate an error with Victoury Public API server

### Error Response Examples

#### Not Found Error
```json
{
    "status": 404,
    "message": "Tenant demo not found.",
    "messageId": "tenant.notFoundError"
}
```

#### Validation Error
```json
{
    "status": 400,
    "message": "Validation error. Check 'errors' field for details.",
    "messageId": "general.validationError",
    "errors": [
        {
            "field": "dealUuid",
            "message": "must not be empty"
        }
    ]
}
```

### Error Response Attributes

- **status** (int) - The HTTP response status code of error returned
- **message** (string) - A brief human-readable message of error returned
- **messageId** (string) - A unique identifier for the error
- **errors** (list) - A list with errors details in case of validation errors
  - **field** (string) - Invalid field
  - **message** (string) - A brief human-readable message of validation error

## Pagination

Some API resources allow for retrieval of information in batches.

Pagination information can be provided as request parameters. We will provide the query args in the resource documentation when available to consume.

When requesting multiple items and pagination information are not specified, we will set default request limit to 100 items. You can specify a different limit.

### Example
```
GET https://api.acceptation-victoury.eu/v2/travelers/1001/deals.json?count=20&page=1
```

### Parameters
- **count** (int) - The number of items to return in one batch
- **page** (int) - The number of page to be returned

## Sorting

Some API resources allow sorting the retrieved information.

The attribute name after which the sorting is wanted and the sorting type can be provided as request parameters.

### Example
```
GET https://api.acceptation-victoury.eu/v2/travelers/1001/deals.json?sort=startDate:desc
```

### Parameters
- **sort** (sortBy:sortType)
  - **sortBy** (string) - name of the attribute after which sorting is wanted
  - **sortType** (string) - type of sorting. Accepted values: "asc", "desc"

## Versioning

The current version of Victoury Public API is **v2**.

The version number must be provided in the request URL.

### Example
```
GET https://api.acceptation-victoury.eu/v2/deals/62454f5113424008888b1c2c.json
```

## API Categories

The API is organized into the following categories:

1. **Service Monitoring** - API health and info endpoints
2. **Traveler** - Traveler-related operations
3. **Deal** - Deal management operations
4. **Document** - Document handling
5. **Product** - Product information and management
6. **Person** - Person/traveler information management
7. **Address** - Address management
8. **Quote** - Quote generation and management
9. **Customer Payments** - Payment processing and management