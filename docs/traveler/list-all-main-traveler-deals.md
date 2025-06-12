# GET List All Main Traveler Deals

Returns a list of deals where the specified traveler is main traveler.

## Endpoint
```
GET {{baseURL}}/{{version}}/travelers/{{mainTravelerId}}/deals.json
```

## Description
- Returns a list of deals where the specified traveler is main traveler
- The id of the main traveler can be retrieved either from Victoury Business API, or from the Authentication system (e.g. Piano ID) used by the consumer of the Victoury Public API
- If provided main traveler id is not found, an error with HTTP response code 404 will be returned

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Query Parameters
- **count** (int) - The number of items to return in one batch
- **page** (int) - The page number to return
- **sort** (string) - Sort field and direction (e.g., "startDate:desc")

## Sorting Options
List of returned deals can be paginated and sorted ascendent or descendent by:
- uuid
- bookingCode
- bookingDate
- startDate
- endDate
- language
- numberOfPersons
- numberOfAdults
- totalSellPriceWithTax
- totalInsurance
- budget
- type

If no sorting information provided, the list of items will be sorted descendent by startDate.

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v2/travelers/2732/deals.json?count=10&page=1&sort=startDate:desc' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}'
```

## Response Structure
The response contains an array of deal objects with traveler information, booking details, and related data.