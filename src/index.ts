import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "./client.js";
import { registerTools } from "./registerTools.js";

const apiKey = process.env.PRESS_ADVANTAGE_API_KEY;
if (!apiKey) {
  console.error("Error: PRESS_ADVANTAGE_API_KEY environment variable is not set.");
  process.exit(1);
}

const client = createClient(apiKey);
const server = new McpServer({ name: "pressadvantage", version: "1.0.0" });
registerTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
