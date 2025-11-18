# BuyICT MCP Server Design

## Overview

An MCP (Model Context Protocol) server that provides Claude with access to BuyICT (Australian Government ICT Procurement) opportunities data through ServiceNow APIs.

## Architecture

### Core Components

1. **MCP Server** (`buyict-server.ts`)
   - Implements MCP protocol
   - Exposes tools for opportunity search and retrieval
   - Manages authentication and session state

2. **ServiceNow Client** (`servicenow-client.ts`)
   - Handles all API communication with BuyICT
   - Manages authentication tokens and cookies
   - Implements retry logic and error handling

3. **Authentication Manager** (`auth-manager.ts`)
   - Stores and refreshes session credentials
   - Handles token expiration
   - Supports multiple auth methods

4. **Data Models** (`types.ts`)
   - TypeScript interfaces for opportunities, filters, etc.
   - Response type definitions

## MCP Tools

### 1. `search_opportunities`
Search for procurement opportunities with filters.

**Parameters:**
- `keyword` (string, optional): Search term
- `marketplace` (string, optional): Filter by marketplace (PCS, SMP, CMP, etc.)
- `page_size` (number, optional): Results per page (default: 15)
- `page` (number, optional): Page number (default: 1)
- `filters` (object, optional): Advanced filters

**Returns:**
- Array of opportunity summaries
- Pagination information
- Total count

**Example:**
```json
{
  "keyword": "cloud services",
  "marketplace": "CMP",
  "page_size": 10
}
```

### 2. `get_opportunity_details`
Get detailed information about a specific opportunity.

**Parameters:**
- `opportunity_id` (string, required): Opportunity system ID
- `table` (string, required): Source table name

**Returns:**
- Full opportunity details
- Requirements
- Timeline
- Contact information

### 3. `list_marketplaces`
Get list of available marketplaces/procurement types.

**Returns:**
- Array of marketplace information
- Table names and descriptions

### 4. `get_filters`
Get available filter options for opportunity search.

**Returns:**
- Available filter categories
- Filter values for each category

## API Integration

### Endpoints Used

1. **Service Portal Page API**
   ```
   GET /api/now/sp/page?id=opportunities&portal_id={PORTAL_ID}
   ```
   - Used for: Initial page structure, widget metadata

2. **Service Portal Widget API** (to be tested)
   ```
   GET/POST /api/now/sp/widget/{WIDGET_ID}
   ```
   - Used for: Fetching opportunity data with filters

3. **Table API** (requires auth)
   ```
   GET /api/now/table/{TABLE_NAME}
   ```
   - Used for: Direct table access if available
   - Requires: Authentication

### Authentication Strategy

**Phase 1: Session Token Approach**
- User provides session cookies from browser
- Stored in configuration file or environment variables
- MCP server uses these for API calls

**Phase 2: Login Flow** (future enhancement)
- Implement actual login with username/password
- Automatically maintain and refresh session

## Configuration

### Environment Variables
```bash
BUYICT_SESSION_ID=...           # JSESSIONID cookie
BUYICT_USER_TOKEN=...           # X-UserToken header
BUYICT_UX_TOKEN=...             # UX-Token header
BUYICT_PORTAL_ID=...            # Portal ID (default: 8a391964dba04810354e33f43a96199f)
```

### Config File (`buyict-config.json`)
```json
{
  "portal_id": "8a391964dba04810354e33f43a96199f",
  "base_url": "https://www.buyict.gov.au",
  "widget_ids": {
    "opportunities": "a5bacf7587fc9950f973a8e50cbb35a8",
    "opportunities_filter": "..."
  },
  "marketplaces": [
    {
      "code": "PCS",
      "name": "Panel & Catalogue Services",
      "table": "u_pcs_procurement",
      "is_module": true
    },
    {
      "code": "SMP",
      "name": "Software Marketplace",
      "table": "u_smp_procurement",
      "is_module": false
    },
    {
      "code": "CMP",
      "name": "Cloud Marketplace",
      "table": "u_cmp_procurement",
      "is_module": false
    },
    {
      "code": "LH",
      "name": "Labour Hire",
      "table": "u_lh_procurement",
      "is_module": true
    },
    {
      "code": "TMP",
      "name": "Telecommunications Marketplace",
      "table": "u_tmp_procurement",
      "is_module": false
    },
    {
      "code": "DC",
      "name": "Data Centre",
      "table": "u_dc_procurement",
      "is_module": false
    },
    {
      "code": "HMP",
      "name": "Hardware Marketplace",
      "table": "u_hmp_procurement",
      "is_module": false
    }
  ]
}
```

## Error Handling

1. **Authentication Errors**
   - Return clear message about expired/invalid tokens
   - Provide instructions for refreshing credentials

2. **API Errors**
   - Retry with exponential backoff
   - Return user-friendly error messages

3. **Rate Limiting**
   - Implement request throttling
   - Cache responses where appropriate

## Testing Strategy

1. **Unit Tests**
   - Test each MCP tool
   - Mock ServiceNow API responses

2. **Integration Tests**
   - Test against live API (with test credentials)
   - Validate response parsing

3. **Manual Testing**
   - Test with Claude Desktop
   - Verify tool responses are useful

## Future Enhancements

1. **Caching Layer**
   - Cache opportunity listings
   - Invalidate on time basis or user request

2. **Webhooks/Notifications**
   - Notify when new opportunities match criteria
   - Email digests

3. **Advanced Filtering**
   - Budget range
   - Location
   - Closing date range

4. **Export Functionality**
   - Export search results to CSV/JSON
   - Generate opportunity reports

## Dependencies

```json
{
  "@modelcontextprotocol/sdk": "latest",
  "axios": "^1.6.0",
  "tough-cookie": "^4.1.3",
  "zod": "^3.22.0"
}
```

## Project Structure

```
buyict_mcp/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── servicenow-client.ts     # ServiceNow API client
│   ├── auth-manager.ts          # Authentication handling
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
├── tests/
│   ├── server.test.ts
│   └── client.test.ts
├── config/
│   └── buyict-config.json       # Configuration
├── package.json
├── tsconfig.json
├── README.md
└── .env.example                 # Example environment variables
```
