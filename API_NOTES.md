# Victoury API Implementation Notes

## Document Endpoints Issue

Based on testing, the document endpoints are returning 404 errors. Here's what we discovered:

### Attempted Endpoints (all returned 404):
1. `/documents/{id}`
2. `/documents/{id}.json`
3. `/document/{id}`
4. `/document/{id}.json`
5. `/deals/documents/{id}`
6. `/deals/{id}/documents`
7. `/offers/{id}`
8. `/offer/{id}`

### Key Finding:
When accessing `/documents/offer_116/download.pdf`, the API returned:
```json
{
  "status": 404,
  "message": "Document null not found.",
  "messageId": "document.notFoundError"
}
```

This error message "Document null not found" suggests:
1. The endpoint exists
2. The API is expecting a different ID format or the document doesn't exist
3. The ID might need to be passed as a parameter rather than in the path

### Possible Solutions:
1. Documents might be accessed through other endpoints (deals, bookings, etc.)
2. The document ID format "offer_116" might be incorrect
3. Documents might require different authentication or headers
4. The document service might not be available in the acceptation environment

### Next Steps:
1. Try accessing documents through deal endpoints first
2. Check if documents are returned as part of deal/booking responses
3. Verify the correct document ID format with the API documentation
4. Consider if documents are only available after certain operations (like creating a booking)

## Working Endpoints:
- `/info` - Returns API version (2.6.0-SNAPSHOT)
- `/health` - Returns health status
- `/deals/{id}.json` - Deal details
- `/deals/search.json` - Search deals
- `/products` - List products (though might have issues)

## Authentication:
Working with:
- Tenant: estivant
- Session-Id: F0B318264EA11D0CE3A3957F8FAD0D4A