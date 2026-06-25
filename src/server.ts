import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createClient } from "./client.js";
import { registerTools } from "./registerTools.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/mcp", async (req, res) => {
  const apiKey = req.query.api_key as string | undefined;

  if (!apiKey) {
    res.status(401).json({ error: "Missing api_key query parameter" });
    return;
  }

  const client = createClient(apiKey);
  const server = new McpServer({ name: "pressadvantage", version: "1.0.0" });
  registerTools(server, client);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Press Advantage MCP server listening on port ${PORT}`);
});
