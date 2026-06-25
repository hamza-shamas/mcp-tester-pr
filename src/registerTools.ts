import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PaClient } from "./client.js";
import { organizationTools } from "./tools/organizations.js";
import { releaseTools } from "./tools/releases.js";
import { distributionTools } from "./tools/distributions.js";
import { pixelTools } from "./tools/pixels.js";
import { scheduledOrderTools } from "./tools/scheduled_orders.js";
import { sandboxTools } from "./tools/sandbox.js";

type ToolDef = {
  name: string;
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  handler: (input: Record<string, unknown>) => Promise<unknown>;
};

export function registerTools(server: McpServer, client: PaClient): void {
  const allTools: ToolDef[] = [
    ...organizationTools(client),
    ...releaseTools(client),
    ...distributionTools(client),
    ...pixelTools(client),
    ...scheduledOrderTools(client),
    ...sandboxTools(client),
  ] as ToolDef[];

  for (const tool of allTools) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema.shape,
      async (input) => {
        try {
          const result = await tool.handler(input as Record<string, unknown>);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          return {
            content: [{ type: "text", text: `Error: ${message}` }],
            isError: true,
          };
        }
      }
    );
  }
}
