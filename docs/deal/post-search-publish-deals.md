# POST Search Publish Deals

Search for published deals using various criteria.

## Endpoint
```
POST {{baseURL}}/{{version}}/deals/search.json
```

## Description
Search for deals using flexible search criteria. Supports searching by multiple fields including ID and UUID (as of 2023-01-27).

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Request Body Properties
- **criteria** (object) - Search criteria
  - **id** (optional) - Deal ID
  - **uuid** (optional) - Deal UUID
  - **startDate** (optional) - Start date filter
  - **endDate** (optional) - End date filter
  - **status** (optional) - Deal status
  - Additional search fields as needed
- **count** (optional int) - Number of results per page (default: 100)
- **page** (optional int) - Page number for pagination
- **sort** (optional string) - Sort field and direction

## Response
Returns an array of deals matching the search criteria.

## Notes
- Supports searching by ID and UUID as of 2023-01-27
- Results are paginated with a default limit of 100 items
- Can combine multiple search criteria

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v2/deals/search.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "criteria": {
        "uuid": "62454f5113424008888b1c2c",
        "status": "active"
    },
    "count": 20,
    "page": 1
}'
```