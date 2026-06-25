# pressadvantage-mcp

MCP server wrapping the [Press Advantage](https://www.pressadvantage.com) API. Enables AI assistants (Claude Code, Claude Desktop, Cursor, etc.) to manage press releases, organizations, distributions, and more via natural language.

## What it does

Once configured, you can talk to Claude naturally instead of writing API calls:

> *"List my organizations"*
> *"Create a sandbox press release for org 5 titled 'Acme Launches New Product'"*
> *"What state is release 123 in?"*
> *"Get the pickup URLs for release 456"*

## Requirements

- Node.js 18+
- A Press Advantage API key (get it from your PA account settings)
- Claude Code CLI

## Setup

**1. Clone and build**
```bash
git clone https://github.com/velluto/pressadvantage-mcp.git
cd pressadvantage-mcp
npm install
npm run build
```

**2. Register with Claude Code**
```bash
claude mcp add pressadvantage node /path/to/pressadvantage-mcp/dist/index.js -e PRESS_ADVANTAGE_API_KEY='your-api-key-here'
```

Replace `/path/to/pressadvantage-mcp` with the actual path where you cloned the repo.

**3. Restart Claude Code**

That's it. The tools are now available in any Claude Code conversation.

## Testing locally (without Claude)

Use the MCP Inspector to browse and call tools directly in a browser UI:

```bash
PRESS_ADVANTAGE_API_KEY='your-api-key-here' npx @modelcontextprotocol/inspector node dist/index.js
```

## Available tools (37 total)

| Group | Tools |
|---|---|
| Organizations | `list_organizations`, `get_organization`, `create_organization`, `update_organization`, `list_organization_releases` |
| Releases | `list_releases`, `get_release`, `create_release`, `order_written_release`, `revise_release`, `approve_release`, `reject_release_to_writers`, `cancel_release`, `finalize_draft_release`, `get_release_pickup_urls` |
| Distributions | `list_distributions`, `add_distribution_upgrade`, `upgrade_to_premium` |
| Retargeting Pixels | `list_pixels`, `get_pixel`, `create_pixel`, `update_pixel` |
| Scheduled Orders | `list_scheduled_orders`, `get_scheduled_order`, `create_scheduled_order`, `update_scheduled_order`, `add_scheduled_video`, `add_scheduled_image`, `add_scheduled_subject`, `add_scheduled_keyword`, `add_first_release_keyword` |
| Sandbox (testing) | `sandbox_editor_rejects`, `sandbox_editor_approves`, `sandbox_distribution_ordered`, `sandbox_distribution_completed`, `sandbox_approve_with_exception`, `sandbox_writers_deliver` |

## Notes

- Each teammate needs their own PA API key — keys are per-account
- Sandbox tools simulate state transitions without real distribution — use them for testing
- The server process runs locally on your machine and makes real HTTP requests to `app.pressadvantage.com`
