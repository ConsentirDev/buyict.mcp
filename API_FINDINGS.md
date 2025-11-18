# BuyICT ServiceNow API Analysis

## API Endpoints Discovered

### 1. Service Portal Page API
**Endpoint:** `https://www.buyict.gov.au/api/now/sp/page`

**Parameters:**
- `id`: Page identifier (e.g., "opportunities")
- `portal_id`: Portal identifier (`8a391964dba04810354e33f43a96199f`)
- `time`: Timestamp
- `request_uri`: Encoded request URI

**Authentication:** None required for public pages

**Response:** Returns page structure with widgets, theme, and metadata

### 2. Opportunities Tables

The system uses multiple procurement tables (marketplaces):

- `u_pcs_procurement` (Panel & Catalogue Services - is_module: true)
- `u_smp_procurement` (Software Marketplace)
- `u_cmp_procurement` (Cloud Marketplace)
- `u_lh_procurement` (Labour Hire - is_module: true)
- `u_tmp_procurement` (Telecommunications Marketplace)
- `u_dc_procurement` (Data Centre)
- `u_hmp_procurement` (Hardware Marketplace)

### 3. Table API (Requires Authentication)
**Endpoint:** `https://www.buyict.gov.au/api/now/table/{table_name}`

**Authentication:** Required

**Error when unauthenticated:**
```json
{
  "error": {
    "message": "User Not Authenticated",
    "detail": "Required to provide Auth information"
  },
  "status": "failure"
}
```

## Widget Information

### Opportunities V2 Widget
**Widget sys_id:** `a5bacf7587fc9950f973a8e50cbb35a8`

**Widget Name:** "Opportunities V2"

**Key Data Structure:**
- `pageItems`: Array of opportunities (empty in initial load)
- `marketplaces.rfq_tables`: List of procurement tables
- `page_size`: Number of items per page (default: 15)
- `startLoc`, `endLoc`: Pagination parameters
- `filters`: Filter criteria
- `logged_in`: User authentication status

## Next Steps

1. **Find Public API Endpoint:** Need to discover if there's a public-facing REST API endpoint for fetching opportunities
2. **Authentication Method:** Understand the authentication requirements (cookies, tokens, API keys)
3. **Direct Widget Call:** Investigate calling the widget's server-side script directly
4. **Web Scraping Alternative:** If no public API exists, may need to parse the HTML/JS

## Questions to Resolve

- Is there a public scripted REST API for opportunities?
- What authentication method should be used for programmatic access?
- Does the widget's `c.server.update()` call a specific endpoint we can access?
- Are there any rate limits or terms of service restrictions?
