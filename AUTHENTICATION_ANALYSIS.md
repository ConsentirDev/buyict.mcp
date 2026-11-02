# BuyICT Authentication Analysis

## Authentication Headers from Original Request

### Cookies Required
```
JSESSIONID=<REDACTED>
glide_user_route=<REDACTED>
glide_node_id_for_js=<REDACTED>
VALK_SESSION_ID=<REDACTED>
```

### UX Token (JWT-like)
```
UX-Token={
  "signature":"<REDACTED>",
  "token":"<REDACTED>"
}
```

**Token Decoded:**
```json
{
  "browserId": "39238cf094be45588a8ab9dd5edd4abd",
  "instanceId": "3f457cfb6f8b6100ea08d4f44b3ee49f",
  "expiry": 1763515276648,
  "instanceName": "ictprocurement"
}
```

### X-UserToken
```
X-UserToken: <REDACTED>
```

### Portal ID
```
x-portal: 8a391964dba04810354e33f43a96199f
```

## Authentication Flow

1. **Initial Access:** Public pages (like `/sp?id=opportunities`) can be accessed without authentication
2. **Session Establishment:** Browser receives cookies (JSESSIONID, glide_user_route, etc.)
3. **Token Generation:** UX-Token and X-UserToken are generated for the session
4. **Authenticated Requests:** Subsequent API calls use these tokens

## For MCP Server

The MCP server will need to:

1. **Option A: Use Existing Session (Current Approach)**
   - User provides session cookies/tokens from their browser
   - MCP server uses these for API calls
   - **Limitation:** Tokens expire, requiring manual refresh

2. **Option B: Implement Login Flow**
   - MCP server authenticates with username/password
   - Maintains session cookies
   - Refreshes tokens as needed
   - **Complexity:** Need to implement full auth flow

3. **Option C: API Key (if available)**
   - Check if BuyICT provides API keys for programmatic access
   - More stable than session tokens
   - **Need to investigate:** If this option exists

## Recommendation

Start with **Option A** for MVP, then explore **Option B** for production use.

The service portal pages appear to be accessible without authentication for initial load, but the actual data requires authenticated API calls.


> Scrubbed 2026-11-02: session cookies and tokens captured in Nov 2025 were removed from this file (they had already expired). History rewrite pending. Never commit live session values; use .env.
