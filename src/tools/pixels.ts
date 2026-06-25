import { z } from "zod";
import type { PaClient } from "../client.js";

export function pixelTools({ paGet, paPost, paPut }: PaClient) {
  return [
    {
      name: "list_pixels",
      description: "List all retargeting pixels in the account",
      inputSchema: z.object({}),
      handler: async () => paGet("/retargeting_pixels.json"),
    },
    {
      name: "get_pixel",
      description: "Get details of a single retargeting pixel",
      inputSchema: z.object({
        id: z.number().describe("Retargeting pixel ID"),
      }),
      handler: async ({ id }: { id: number }) => paGet(`/retargeting_pixels/${id}.json`),
    },
    {
      name: "create_pixel",
      description: "Create a new retargeting pixel to attach to press releases",
      inputSchema: z.object({
        name: z.string().describe("Display name for this pixel"),
        code: z.string().describe("The pixel tracking code/script to embed"),
      }),
      handler: async (input: Record<string, unknown>) =>
        paPost("/retargeting_pixels.json", { retargeting_pixel: input }),
    },
    {
      name: "update_pixel",
      description: "Update an existing retargeting pixel",
      inputSchema: z.object({
        id: z.number().describe("Retargeting pixel ID to update"),
        name: z.string().optional().describe("Updated display name"),
        code: z.string().optional().describe("Updated pixel tracking code/script"),
      }),
      handler: async ({ id, ...rest }: { id: number } & Record<string, unknown>) =>
        paPut(`/retargeting_pixels/${id}.json`, { retargeting_pixel: rest }),
    },
  ];
}
