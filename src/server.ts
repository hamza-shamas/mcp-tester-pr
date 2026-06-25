import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createClient } from "./client.js";
import { registerTools } from "./registerTools.js";

const app = express();
app.use(express.json());

// active SSE sessions: sessionId → transport
const sseSessions = new Map<string, SSEServerTransport>();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Claude Desktop connects here (SSE transport)
app.get("/sse", async (req, res) => {
  const apiKey = req.query.api_key as string | undefined;

  if (!apiKey) {
    res.status(401).json({ error: "Missing api_key query parameter" });
    return;
  }

  const transport = new SSEServerTransport("/messages", res);
  sseSessions.set(transport.sessionId, transport);

  const client = createClient(apiKey);
  const server = new McpServer({ name: "pressadvantage", version: "1.0.0" });
  registerTools(server, client);

  res.on("close", () => {
    sseSessions.delete(transport.sessionId);
    transport.close();
    server.close();
  });

  await server.connect(transport);
});

// SSE message endpoint
app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string | undefined;

  if (!sessionId) {
    res.status(400).json({ error: "Missing sessionId" });
    return;
  }

  const transport = sseSessions.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await transport.handlePostMessage(req, res);
});

// Newer MCP clients connect here (Streamable HTTP transport)
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
