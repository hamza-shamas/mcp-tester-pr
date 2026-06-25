import { z } from "zod";
import type { PaClient } from "../client.js";

export function distributionTools({ paGet, paPost, paPut }: PaClient) {
  return [
    {
      name: "list_distributions",
      description:
        "List available distribution add-on channels for a release. " +
        "Use the returned IDs with add_distribution_upgrade to add channels.",
      inputSchema: z.object({
        release_id: z.number().describe("Release ID to list available distributions for"),
      }),
      handler: async ({ release_id }: { release_id: number }) =>
        paGet(`/releases/${release_id}/distributions.json`),
    },
    {
      name: "add_distribution_upgrade",
      description: "Add a specific distribution channel (wire) to an existing release",
      inputSchema: z.object({
        release_id: z.number().describe("Release ID"),
        distribution_id: z.number().describe("Distribution channel ID from list_distributions"),
      }),
      handler: async ({ release_id, distribution_id }: { release_id: number; distribution_id: number }) =>
        paPut(`/releases/${release_id}/add_distribution_upgrade.json`, { distribution_id }),
    },
    {
      name: "upgrade_to_premium",
      description:
        "Upgrade an existing release to premium distribution, adding Yahoo Finance and other premium outlets",
      inputSchema: z.object({
        release_id: z.number().describe("Release ID to upgrade"),
      }),
      handler: async ({ release_id }: { release_id: number }) =>
        paPost(`/releases/${release_id}/upgrade_distribution.json`),
    },
  ];
}
