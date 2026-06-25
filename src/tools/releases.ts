import { z } from "zod";
import type { PaClient } from "../client.js";

export function releaseTools({ paGet, paPost }: PaClient) {
  return [
    {
      name: "list_releases",
      description: "List all press releases in the account",
      inputSchema: z.object({}),
      handler: async () => paGet("/releases.json"),
    },
    {
      name: "get_release",
      description: "Get details and current state of a single press release",
      inputSchema: z.object({
        id: z.number().describe("Release ID"),
      }),
      handler: async ({ id }: { id: number }) => paGet(`/releases/${id}.json`),
    },
    {
      name: "create_release",
      description:
        "Create a self-written press release. The customer provides the full content. " +
        "Use order_written_release instead if you want Press Advantage writers to write it.",
      inputSchema: z.object({
        organization_id: z.number().describe("ID of the organization this release belongs to"),
        title: z.string().describe("Title of the press release"),
        body: z.string().describe("Full HTML body of the press release"),
        description: z.string().optional().describe("Short summary / meta description"),
        distribution: z
          .enum(["standard", "premium"])
          .optional()
          .describe("Distribution tier. 'standard' is default wire distribution. 'premium' adds Yahoo Finance. Omit unless user explicitly requests premium."),
        schedule_distribution: z
          .boolean()
          .optional()
          .describe("Set to true to schedule distribution for a future date (provide distribute_at)"),
        distribute_at: z
          .string()
          .optional()
          .describe("ISO 8601 datetime to schedule distribution, e.g. '2026-07-01T09:00:00Z'"),
        draft_order: z
          .boolean()
          .optional()
          .describe("If true, saves as a draft instead of submitting as an active order"),
        sandbox_order: z
          .boolean()
          .optional()
          .describe("If true, creates a test/sandbox release that won't be distributed for real"),
      }),
      handler: async ({ organization_id, ...rest }: Record<string, unknown>) =>
        paPost("/releases/with_content.json", { release: { organization_id, ...rest } }),
    },
    {
      name: "order_written_release",
      description:
        "Order a professionally written press release. Press Advantage writers will create the content based on your brief.",
      inputSchema: z.object({
        organization_id: z.number().describe("ID of the organization this release belongs to"),
        main_keyword: z.string().describe("Primary keyword the release should target"),
        url: z.string().describe("Target URL the release should link to"),
        keyword: z.string().optional().describe("Anchor text for the target URL link"),
        notes: z.string().optional().describe("Brief or instructions for the writers"),
        rewrite_instructions: z
          .string()
          .optional()
          .describe("Specific rewrite instructions if this is a revision order"),
        distribution: z
          .enum(["standard", "premium"])
          .optional()
          .describe("Distribution tier. Defaults to standard."),
        schedule_distribution: z.boolean().optional(),
        distribute_at: z.string().optional().describe("ISO 8601 datetime for scheduled distribution"),
        draft_order: z.boolean().optional().describe("Save as draft instead of active order"),
        sandbox_order: z.boolean().optional().describe("Test/sandbox order — no real distribution"),
      }),
      handler: async (input: Record<string, unknown>) =>
        paPost("/releases.json", { release: input }),
    },
    {
      name: "revise_release",
      description: "Submit revised content for a release that needs content revision",
      inputSchema: z.object({
        id: z.number().describe("Release ID"),
        title: z.string().optional().describe("Updated title"),
        body: z.string().optional().describe("Updated HTML body"),
      }),
      handler: async ({ id, ...rest }: { id: number } & Record<string, unknown>) =>
        paPost(`/releases/${id}/revise_content.json`, { release: rest }),
    },
    {
      name: "approve_release",
      description:
        "Approve the content of a release that is waiting for customer approval. Optionally include edited content.",
      inputSchema: z.object({
        id: z.number().describe("Release ID"),
        title: z.string().optional().describe("Optionally override the title before approving"),
        body: z.string().optional().describe("Optionally override the body before approving"),
      }),
      handler: async ({ id, ...rest }: { id: number } & Record<string, unknown>) =>
        paPost(`/releases/${id}/approve_content.json`, { release: rest }),
    },
    {
      name: "reject_release_to_writers",
      description: "Reject the release content and send it back to writers with revision instructions",
      inputSchema: z.object({
        id: z.number().describe("Release ID"),
        rewrite_instructions: z
          .string()
          .describe("Clear instructions telling writers what to change and why"),
      }),
      handler: async ({ id, rewrite_instructions }: { id: number; rewrite_instructions: string }) =>
        paPost(`/releases/${id}/reject_content_to_writers.json`, {
          release: { rewrite_instructions },
        }),
    },
    {
      name: "cancel_release",
      description: "Cancel a press release order",
      inputSchema: z.object({
        id: z.number().describe("Release ID to cancel"),
      }),
      handler: async ({ id }: { id: number }) => paPost(`/releases/${id}/cancel.json`),
    },
    {
      name: "finalize_draft_release",
      description: "Convert a draft release into an active order, submitting it for processing",
      inputSchema: z.object({
        id: z.number().describe("Draft release ID to finalize"),
      }),
      handler: async ({ id }: { id: number }) =>
        paPost(`/releases/${id}/finalize_draft_order.json`),
    },
    {
      name: "get_release_pickup_urls",
      description:
        "Get the list of pickup URLs showing where this release was published across news outlets. " +
        "Only available once the release is in 'completed' state.",
      inputSchema: z.object({
        id: z.number().describe("Release ID"),
      }),
      handler: async ({ id }: { id: number }) => paGet(`/releases/${id}/built_urls.json`),
    },
  ];
}
