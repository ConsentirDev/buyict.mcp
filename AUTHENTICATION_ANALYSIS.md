# BuyICT Authentication Analysis

## Authentication Headers from Original Request

### Cookies Required
```
JSESSIONID=8970B7AF8AB970B15F402BC284B10104
glide_user_route=glide.feb46449bf77c48e81965b7dafe7d783
glide_node_id_for_js=5c487056090fbed485c337ffe6c56996c05c6a82a72a1d509873e28ba6021468
VALK_SESSION_ID=EEF44CEE9DE3943109CE6B6A6DC3BC44
```

### UX Token (JWT-like)
```
UX-Token={
  "signature":"MEUCIQC6bWkvAE79BmejBacBPChp0GfpbmzONW8jfdV7Ezo0fQIgCUfETO-YujQnvNlkhRlXy94JBfBdiEnbXwWBge7RmSw=",
  "token":"eyJhbGciOiJub25lIn0.eyJicm93c2VySWQiOiIzOTIzOGNmMDk0YmU0NTU4OGE4YWI5ZGQ1ZWRkNGFiZCIsImluc3RhbmNlSWQiOiIzZjQ1N2NmYjZmOGI2MTAwZWEwOGQ0ZjQ0YjNlZTQ5ZiIsImV4cGlyeSI6MTc2MzUxNTI3NjY0OCwiaW5zdGFuY2VOYW1lIjoiaWN0cHJvY3VyZW1lbnQifQ."
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
X-UserToken: ce5b659993557a1008c1f2edfaba10723d58a0a4da46e543531b204dfb38f0762195af1b
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
