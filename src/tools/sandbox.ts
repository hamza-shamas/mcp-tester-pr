import { z } from "zod";
import type { PaClient } from "../client.js";

export function sandboxTools({ paPost }: PaClient) {
  const sandboxTool = (name: string, description: string, endpoint: string) => ({
    name,
    description: `[SANDBOX/TESTING ONLY] ${description}`,
    inputSchema: z.object({
      id: z.number().describe("Release ID"),
    }),
    handler: async ({ id }: { id: number }) =>
      paPost(`/releases/sandbox/${id}/${endpoint}.json`),
  });

  return [
    sandboxTool(
      "sandbox_editor_rejects",
      "Simulate an editor rejecting the release content back to the customer for revision",
      "editor_rejects_content_to_customer"
    ),
    sandboxTool(
      "sandbox_editor_approves",
      "Simulate an editor approving the release content",
      "editor_approves_content"
    ),
    sandboxTool(
      "sandbox_distribution_ordered",
      "Simulate distribution being ordered / triggered",
      "distribution_ordered"
    ),
    sandboxTool(
      "sandbox_distribution_completed",
      "Simulate distribution completing — release moves to 'completed' state",
      "distribution_completed"
    ),
    sandboxTool(
      "sandbox_approve_with_exception",
      "Simulate an editor approving an order that has a guideline exception",
      "editor_approves_order_with_exception"
    ),
    sandboxTool(
      "sandbox_writers_deliver",
      "Simulate writers delivering content for a written-for-you release",
      "writers_deliver_order"
    ),
  ];
}
