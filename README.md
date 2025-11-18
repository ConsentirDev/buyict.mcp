# BuyICT MCP Server

A Model Context Protocol (MCP) server that provides Claude with access to Australian Government ICT procurement opportunities from [BuyICT](https://www.buyict.gov.au).

<a href="https://glama.ai/mcp/servers/@ConsentirDev/buyict.mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@ConsentirDev/buyict.mcp/badge" alt="BuyICT Server MCP server" />
</a>

## Features

- 🔍 Search procurement opportunities across multiple marketplaces
- 📋 Get detailed information about specific opportunities
- 🏪 List available marketplaces (PCS, SMP, CMP, LH, TMP, DC, HMP)
- 🔐 Supports authenticated access to BuyICT ServiceNow instance

## Installation

1. Clone this repository or navigate to the project directory:
```bash
cd buyict_mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Configuration

### 1. Environment Variables

Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env
```

### 2. Obtaining Session Credentials

To access BuyICT data, you need to provide session credentials from your browser:

1. Open https://www.buyict.gov.au in your browser
2. Log in (if required for the opportunities you want to access)
3. Open Developer Tools (F12)
4. Go to the **Network** tab
5. Navigate to the Opportunities page or refresh it
6. Look for a request to `/api/now/sp/page?id=opportunities`
7. Click on it and go to the **Headers** section
8. Find and copy the following values to your `.env` file:

**From the Cookie header:**
- `JSESSIONID` → `BUYICT_SESSION_ID`
- `glide_user_route` → `BUYICT_GLIDE_USER_ROUTE`
- `glide_node_id_for_js` → `BUYICT_GLIDE_NODE_ID`
- `VALK_SESSION_ID` → `BUYICT_VALK_SESSION_ID`

**From request headers:**
- `X-UserToken` → `BUYICT_USER_TOKEN`
- `UX-Token` → `BUYICT_UX_TOKEN`

**Note:** These tokens expire after some time. If you get authentication errors, you'll need to refresh them by repeating this process.

## Usage with Claude Desktop

1. Add the server to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "buyict": {
      "command": "node",
      "args": ["/absolute/path/to/buyict_mcp/dist/index.js"],
      "env": {
        "BUYICT_SESSION_ID": "your_session_id_here",
        "BUYICT_USER_TOKEN": "your_user_token_here",
        "BUYICT_UX_TOKEN": "your_ux_token_here"
      }
    }
  }
}
```

Or, to load from your `.env` file, use a wrapper script.

2. Restart Claude Desktop

3. The server will now be available with the following tools:

## Available Tools

### `search_opportunities`

Search for procurement opportunities with optional filters.

**Parameters:**
- `keyword` (string, optional): Search term to filter opportunities
- `marketplace` (string, optional): Filter by marketplace code (PCS, SMP, CMP, LH, TMP, DC, HMP)
- `page_size` (number, optional): Results per page (default: 15, max: 100)
- `page` (number, optional): Page number (default: 1)

**Example:**
```
Search for cloud computing opportunities in the Cloud Marketplace
```

### `get_opportunity_details`

Get detailed information about a specific opportunity.

**Parameters:**
- `opportunity_id` (string, required): The sys_id of the opportunity
- `table` (string, required): Source table name (e.g., u_cmp_procurement)

**Example:**
```
Get details for opportunity ID abc123 from the u_cmp_procurement table
```

### `list_marketplaces`

Get a list of all available marketplaces.

**Example:**
```
Show me all available BuyICT marketplaces
```

## Marketplaces

The server supports the following BuyICT marketplaces:

| Code | Name | Table |
|------|------|-------|
| PCS | Panel & Catalogue Services | u_pcs_procurement |
| SMP | Software Marketplace | u_smp_procurement |
| CMP | Cloud Marketplace | u_cmp_procurement |
| LH | Labour Hire | u_lh_procurement |
| TMP | Telecommunications Marketplace | u_tmp_procurement |
| DC | Data Centre | u_dc_procurement |
| HMP | Hardware Marketplace | u_hmp_procurement |

## Development

### Project Structure

```
buyict_mcp/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── servicenow-client.ts     # ServiceNow API client
│   └── types.ts                 # TypeScript type definitions
├── config/
│   └── buyict-config.json       # Server configuration
├── dist/                        # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Building

```bash
npm run build
```

### Development Mode (with watch)

```bash
npm run dev
```

### Testing

Start the server manually to test:
```bash
npm start
```

## Current Limitations

⚠️ **Important:** The current implementation has some limitations due to the ServiceNow Service Portal architecture:

1. **Data Fetching:** The `search_opportunities` tool currently returns the initial page structure but may not include actual opportunity data. This is because:
   - ServiceNow widgets load data asynchronously via server-side scripts
   - The exact API endpoint for fetching opportunity data needs further investigation
   - May require authenticated access for full data access

2. **Authentication:** Session tokens expire and need to be manually refreshed from your browser.

3. **Future Improvements Needed:**
   - Discover the correct API endpoint for fetching opportunity listings
   - Implement automatic session refresh
   - Add caching to reduce API calls
   - Support more advanced filtering options

## API Documentation

See these files for more details:
- `API_FINDINGS.md` - Detailed API analysis and findings
- `AUTHENTICATION_ANALYSIS.md` - Authentication mechanisms and requirements
- `MCP_SERVER_DESIGN.md` - Architecture and design decisions

## Troubleshooting

### "User Not Authenticated" Error

This means your session tokens have expired. Follow the [Configuration](#configuration) steps to get new tokens from your browser.

### No Opportunities Returned

The search endpoint may require further implementation. Check the server logs for details. You may need to access opportunities directly via the website or investigate additional API endpoints.

### Connection Issues

Ensure:
- You have internet connectivity
- BuyICT website is accessible
- Your tokens are valid and not expired

## Contributing

This is a work in progress. Contributions are welcome, especially:
- Discovering the correct API endpoints for opportunity data
- Implementing automatic authentication
- Adding more filtering and search capabilities
- Improving error handling

## License

MIT

## Disclaimer

This is an unofficial tool and is not affiliated with or endorsed by the Australian Government Digital Transformation Agency or BuyICT. Use responsibly and in accordance with BuyICT's terms of service.