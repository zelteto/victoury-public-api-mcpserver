# POST Quote Initialized By Prices

Initialize a quote based on price information for products and arrangements.

## Endpoint
```
POST {{baseURL}}/{{version}}/quote.json
```

## Description
Creates a quote by calculating prices based on provided arrangements, traveler assignments, and product information.

## Headers
```
Content-Type: application/json
Tenant: {{tenant}}
Session-Id: {{apiKey}}
```

## Request Body Properties

### Root Level
- **recalc** (mandatory boolean) - Whether to recalculate prices
- **autoBook** (optional boolean) - Used to automatically load arrangements for auto products. Auto products are products that may be offered by a tenant and can be customized based on the specific needs of the tenant.
- **arrangements** (mandatory list of objects) - List of arrangement objects

### Arrangement Object Properties
- **productCode** (mandatory string) - Product code
- **priceId** (mandatory long) - Price ID
- **productBegin** (mandatory date) - Start date in "YYYY-MM-DD" format
- **productEnd** (mandatory date) - End date in "YYYY-MM-DD" format
- **hasAllotments** (mandatory boolean) - HasAllotments value of the product
- **tourCode** (mandatory string) - Tour code
- **buyQty** (optional int) - Buy quantity (see notes below)
- **sellQty** (optional int) - Sell quantity (see notes below)
- **sellMultiplier** (optional int) - The multiplier refers to the number of products or services that will be sold. Default: 1
- **calculationProfitPercentage** (mandatory double) - Profit value of the price
- **profitCenter** (mandatory string) - Code of deal brand
- **travelerAssignments** (mandatory list of objects) - List of traveler assignment objects

#### Quantity Rules
- If the price oneTimeCharge attribute is TRUE: buyQty and sellQty should be 1
- If the price oneTimeCharge is FALSE and product's chargeNights is TRUE: quantities should represent the number of nights
- If the price oneTimeCharge is FALSE and product's chargeNights is FALSE: quantities should represent the number of days
- If no value provided, values will be calculated by quote service

### TravelerAssignment Object Properties
- **birthDate** (mandatory date) - Date in "YYYY-MM-DD" format
- **ref** (mandatory string) - Unique generated reference value for each travelerAssignment

## Example Request
```bash
curl --location 'https://api.acceptation-victoury.eu/v2/quote.json' \
--header 'Content-Type: application/json' \
--header 'Tenant: {{tenant}}' \
--header 'Session-Id: {{apiKey}}' \
--data '{
    "recalc": true,
    "autoBook": false,
    "arrangements": [
        {
            "productCode": "GRDASPL8D",
            "priceId": 85,
            "productBegin": "2023-09-27",
            "productEnd": "2023-10-04",
            "hasAllotments": true,
            "tourCode": "DASPL8D230927",
            "buyQty": 1,
            "sellQty": 1,
            "sellMultiplier": 1,
            "calculationProfitPercentage": 26.44,
            "travelerAssignments": [
                {
                    "birthDate": "1956-09-04",
                    "ref": "57527388-ecee-a6e5-2812-31fd9d673da8"
                },
                {
                    "birthDate": "2021-02-02",
                    "ref": "316fe1b5-5278-a5ae-67f8-0ecd915b06f9"
                }
            ],
            "profitCenter": "GO"
        }
    ]
}'
```

## Example Response (200 OK)
```json
{
  "items": [
    {
      "arrangements": [
        {
          "id": null,
          "productCode": "GRDASPL8D",
          "productBegin": "2023-09-27",
          "productEnd": "2023-10-04",
          "productId": 25,
          "productName": "Dalmatië - Split & Makarska",
          "productCategory": "GR",
          "buyUnitPrice": 882,
          "buyMultiplier": 1,
          "buyQty": 1,
          "buyTotalPrice": 1764,
          "sellUnitPrice": 1199,
          "sellMultiplier": 1,
          "sellQty": 1,
          "sellTotalPrice": 2398,
          "profitPercentage": 26.438698915763137,
          "marginPercentage": 35.941043083900226,
          "priceId": 85,
          "isPackage": true,
          "isPerPerson": true,
          "oneTimeCharge": true,
          "persons": 2,
          "hasAllotments": true,
          "tourCode": "DASPL8D230927",
          "profitCenter": "GO",
          "travelerAssignments": [
            {
              "birthDate": "1956-09-04",
              "ref": "57527388-ecee-a6e5-2812-31fd9d673da8",
              "totalSellPriceWithTax": 1199
            },
            {
              "birthDate": "2021-02-02",
              "ref": "316fe1b5-5278-a5ae-67f8-0ecd915b06f9",
              "totalSellPriceWithTax": 1199
            }
          ]
        }
      ],
      "travelers": [
        {
          "ref": "57527388-ecee-a6e5-2812-31fd9d673da8",
          "birthDate": "Tue Sep 04 00:00:00 UTC 1956",
          "totalSellPriceWithTaxWithInsurance": 1199,
          "totalSellPriceWithTaxNoInsurance": 1199,
          "totalBuyPriceWithTax": 882,
          "profit": 26.438698915763137,
          "markup": 35.941043083900226,
          "margin": 317
        },
        {
          "ref": "316fe1b5-5278-a5ae-67f8-0ecd915b06f9",
          "birthDate": "Tue Feb 02 00:00:00 UTC 2021",
          "totalSellPriceWithTaxWithInsurance": 1199,
          "totalSellPriceWithTaxNoInsurance": 1199,
          "totalBuyPriceWithTax": 882,
          "profit": 26.438698915763137,
          "markup": 35.941043083900226,
          "margin": 317
        }
      ],
      "totalSellPriceNoTax": 2398,
      "totalSellPriceWithTax": 2398,
      "totalBuyPriceWithTax": 1764,
      "totalBuyPrice": 1764,
      "profitNet": 634,
      "profitNetPercentage": 26.438698915763137,
      "marginPercentage": 35.941043083900226
    }
  ],
  "totalRecords": 1
}
```