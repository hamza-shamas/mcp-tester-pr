import { z } from "zod";
import type { PaClient } from "../client.js";

const OrgFields = {
  name: z.string().describe("Name of the organization"),
  contact_name: z.string().optional().describe("Primary contact full name"),
  contact_phone: z.string().optional().describe("Primary contact phone number"),
  contact_email: z.string().optional().describe("Primary contact email address"),
  website_url: z.string().optional().describe("Organization website URL"),
  about_text: z.string().optional().describe("Short description about the organization"),
  address: z.string().optional().describe("Physical address"),
  facebook_id: z.string().optional().describe("Facebook page ID or handle"),
  twitter_id: z.string().optional().describe("Twitter/X handle (without @)"),
  show_website_in_iframe: z.boolean().optional().describe("Embed website in iframe on press room page"),
  show_on_pressadvantage_homepage: z.boolean().optional().describe("Feature organization on the PA homepage"),
};

export function organizationTools({ paGet, paPost, paPut }: PaClient) {
  return [
    {
      name: "list_organizations",
      description: "List all organizations in the account",
      inputSchema: z.object({}),
      handler: async () => paGet("/organizations.json"),
    },
    {
      name: "get_organization",
      description: "Get details of a single organization by ID",
      inputSchema: z.object({
        id: z.number().describe("Organization ID"),
      }),
      handler: async ({ id }: { id: number }) => paGet(`/organizations/${id}.json`),
    },
    {
      name: "create_organization",
      description: "Create a new organization",
      inputSchema: z.object(OrgFields),
      handler: async (input: Record<string, unknown>) =>
        paPost("/organizations.json", { organization: input }),
    },
    {
      name: "update_organization",
      description: "Update an existing organization",
      inputSchema: z.object({
        id: z.number().describe("Organization ID to update"),
        ...Object.fromEntries(
          Object.entries(OrgFields).map(([k, v]) => [k, v.optional()])
        ),
      }),
      handler: async ({ id, ...rest }: { id: number } & Record<string, unknown>) =>
        paPut(`/organizations/${id}.json`, { organization: rest }),
    },
    {
      name: "list_organization_releases",
      description: "List all releases belonging to a specific organization",
      inputSchema: z.object({
        id: z.number().describe("Organization ID"),
      }),
      handler: async ({ id }: { id: number }) =>
        paGet(`/organizations/${id}/releases.json`),
    },
  ];
}
