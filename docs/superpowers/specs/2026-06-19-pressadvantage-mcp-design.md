# Press Advantage MCP Server — Design Spec

**Date:** 2026-06-19

## Context

The Press Advantage platform exposes a REST API for managing press releases, organizations, distributions, retargeting pixels, and scheduled release orders. This MCP server wraps that API so AI assistants (Claude Code, Claude Desktop, Cursor, etc.) can call PA operations directly as structured tools — no manual curl, no copy-pasting API docs.

## Architecture

- **Standalone Node.js project** — `pressadvantage-mcp`
- **Language:** TypeScript, targeting Node.js 18+
- **Transport:** stdio (works with any MCP-compatible client)
- **Auth:** `PRESS_ADVANTAGE_API_KEY` env var, injected as `?api_key=` query param on every request
- **No Anthropic key required** — the server never calls Claude; Claude calls it

## File Structure

```
src/
├── index.ts                  ← entry: registers all 37 tools, starts MCP server
├── client.ts                 ← shared HTTP wrapper (paGet / paPost / paPut)
└── tools/
    ├── organizations.ts      ← 5 tools
    ├── releases.ts           ← 10 tools
    ├── distributions.ts      ← 3 tools
    ├── pixels.ts             ← 4 tools
    ├── scheduled_orders.ts   ← 9 tools
    └── sandbox.ts            ← 6 tools (dev/testing state simulation)
```

## Tool List (37 total)

| File | Tools |
|---|---|
| organizations | list_organizations, get_organization, create_organization, update_organization, list_organization_releases |
| releases | list_releases, get_release, create_release, order_written_release, revise_release, approve_release, reject_release_to_writers, cancel_release, finalize_draft_release, get_release_pickup_urls |
| distributions | list_distributions, add_distribution_upgrade, upgrade_to_premium |
| pixels | list_pixels, get_pixel, create_pixel, update_pixel |
| scheduled_orders | list_scheduled_orders, get_scheduled_order, create_scheduled_order, update_scheduled_order, add_scheduled_video, add_scheduled_image, add_scheduled_subject, add_scheduled_keyword, add_first_release_keyword |
| sandbox | sandbox_editor_rejects, sandbox_editor_approves, sandbox_distribution_ordered, sandbox_distribution_completed, sandbox_approve_with_exception, sandbox_writers_deliver |

## Error Handling

| Scenario | Behaviour |
|---|---|
| Missing API key | Crash at startup with descriptive message |
| 401 Unauthorized | Returns "Invalid API key" |
| 404 Not Found | Returns "Resource not found (404): <path>" |
| 422 Validation error | Forwards PA API's own error message |
| Network timeout (30s) | Returns "Request timed out — PA API unreachable" |
| Other 5xx | Returns status code + raw response body |

## Client Configuration

Add to `.claude/mcp.json` (Claude Code) or `claude_desktop_config.json` (Claude Desktop):

```json
{
  "mcpServers": {
    "pressadvantage": {
      "command": "node",
      "args": ["/path/to/pressadvantage-mcp/dist/index.js"],
      "env": {
        "PRESS_ADVANTAGE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```
