# Victoury Public API v2 Documentation

This directory contains the complete documentation for the Victoury Public API v2, organized by categories and endpoints.

## Documentation Structure

### General Documentation
- [00-overview.md](./00-overview.md) - API overview, authentication, error handling, pagination, and sorting
- [01-changelog.md](./01-changelog.md) - API version history and changes

### API Endpoints by Category

#### Service Monitoring
- [GET Retrieve API Info](./service-monitoring/get-api-info.md) - Get API version and environment information
- [GET Retrieve API Health](./service-monitoring/get-api-health.md) - Check API health status

#### Traveler
- [GET List All Main Traveler Deals](./traveler/list-all-main-traveler-deals.md) - Get deals for a specific traveler

#### Deal
- [GET Retrieve Deal Details](./deal/get-retrieve-deal-details.md) - Get comprehensive deal information
- [PATCH Update Deal](./deal/patch-update-deal.md) - Update deal information
- [POST Search Publish Deals](./deal/post-search-publish-deals.md) - Search for deals using criteria
- [POST Create Option/Booking](./deal/post-create-option-booking.md) - Create new options or bookings

#### Document
- [GET Retrieve Document](./document/get-document.md) - Retrieve invoices, vouchers, and other documents

#### Product
- [GET Retrieve Product Details](./product/get-product-details.md) - Get detailed product information
- [POST Retrieve Product Starting Dates](./product/post-product-starting-dates.md) - Get available start dates
- [POST Retrieve Product Starting Date Prices](./product/post-product-starting-date-prices.md) - Get pricing for specific dates
- [POST Retrieve Product Package Price Availability](./product/post-product-package-price-availability.md) - Check package pricing and availability

#### Person
- [PATCH Update Person](./person/patch-update-person.md) - Update person/traveler information

#### Address
- [PATCH Update Address](./address/patch-update-address.md) - Update address information

#### Quote
- [POST Quote Initialized By Prices](./quote/post-quote-initialized-by-prices.md) - Create quotes based on pricing

#### Customer Payments
- [POST Register Customer Payment](./customer-payments/post-register-customer-payment.md) - Register customer payments

## API Environments

### Acceptation (Testing)
```
https://api.acceptation-victoury.net
```

### Production
```
https://api.victoury.eu
```

## Authentication

All API requests require two headers:
- `Tenant`: Your tenant code
- `Session-Id`: Your API key

## Need More Information?

For additional endpoints and detailed information, please refer to the individual documentation files or contact Victoury support.