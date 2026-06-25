# Hosted MCP Server — Design Spec

**Date:** 2026-06-25

## Context

The existing MCP server runs via stdio — each developer installs it locally on their machine. This works for the internal team but is too technical for clients. The goal is a hosted HTTP version clients connect to via a URL, using their existing PA API key. Nothing to install, nothing to build — just a URL in their Claude config.

## What Changes

Only 4 things change. All 37 tools are untouched.

| File | Change |
|---|---|
| `src/client.ts` | Refactor to `createClient(apiKey)` factory instead of reading from env |
| `src/index.ts` | Updated to call `createClient(process.env.PRESS_ADVANTAGE_API_KEY)` |
| `src/server.ts` | New file — Express + StreamableHTTPServerTransport |
| `package.json` | Add `express`, `@types/express`, add `serve` script |

## Architecture

```
Client's Claude config:
  url: https://mcp.pressadvantage.com/mcp?api_key=their-pa-key

        ↓  POST /mcp

Express server (src/server.ts)
  - Reads api_key from query param
  - No api_key → 401 immediately
  - Creates MCP instance with that key
  - Runs tool, returns result

        ↓  HTTP request with api_key

PA API (app.pressadvantage.com)
  - Wrong key → 401 forwarded to Claude as error
  - Valid key → data returned to Claude
```

## Auth Flow

- Client passes their existing PA API key as `?api_key=` query param on every request
- No new token system — the PA API key IS the auth credential
- No separate validation call — if the key is wrong the PA API returns 401 on the first tool call, which gets forwarded to Claude as a readable error message
- No api_key present → server returns HTTP 401 before the MCP layer even sees the request

## `client.ts` Refactor

```typescript
// Before — reads from env at module level
const API_KEY = process.env.PRESS_ADVANTAGE_API_KEY

// After — factory, accepts key as parameter
export function createClient(apiKey: string) {
  return {
    paGet:  (path) => request("GET",  path, apiKey),
    paPost: (path, body) => request("POST", path, apiKey, body),
    paPut:  (path, body) => request("PUT",  path, apiKey, body),
  }
}
```

- `src/index.ts` (stdio): `createClient(process.env.PRESS_ADVANTAGE_API_KEY)` — same behaviour as today
- `src/server.ts` (HTTP): `createClient(req.query.api_key)` — per-request key

## `server.ts` Structure

- Express app on `PORT` env var (default 3000)
- Single endpoint: `POST /mcp`
- Uses `StreamableHTTPServerTransport` from `@modelcontextprotocol/sdk`
- Per-request: extract key → create client → register tools → handle request → destroy session
- Health check: `GET /health` → 200 OK (for uptime monitoring)

## Client Setup (once hosted)

```json
{
  "mcpServers": {
    "pressadvantage": {
      "url": "https://mcp.pressadvantage.com/mcp?api_key=their-pa-key"
    }
  }
}
```

One line in their Claude config. Nothing else required.

## Deployment

- `npm run build` → compiles both `index.js` and `server.js` to `dist/`
- `npm run serve` → starts hosted server (`node dist/server.js`)
- `npm start` → still starts stdio version (unchanged)
- Hosting: Render, Railway, DigitalOcean, or existing infrastructure
- No `PRESS_ADVANTAGE_API_KEY` env var needed on the server — keys come from requests

## Verification

- [ ] `npm run build` compiles with no errors
- [ ] `POST /mcp` with no api_key → returns 401
- [ ] `POST /mcp?api_key=invalid` → tool call returns "Invalid API key"
- [ ] `POST /mcp?api_key=real-key` → `list_organizations` returns real data
- [ ] `GET /health` → returns 200 OK
- [ ] stdio version (`npm start`) still works as before
- [ ] Client connects via URL in Claude config and can call tools naturally
