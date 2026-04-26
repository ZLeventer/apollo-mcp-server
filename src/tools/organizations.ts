import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApolloClient } from "../client.js";
import { asResult } from "./_shared.js";

export function registerOrganizationTools(server: McpServer, client: ApolloClient): void {
  server.registerTool(
    "search_organizations",
    {
      description:
        "Search Apollo.io companies/organizations by name, industry, size, or location. Returns account records with domain, employee count, revenue, and tech stack data.",
      inputSchema: {
        q_organization_name: z.string().optional().describe("Company name keyword search"),
        organization_industry_tag_ids: z.array(z.string()).optional(),
        organization_num_employees_ranges: z
          .array(z.string())
          .optional()
          .describe("Employee count ranges e.g. ['1,10','11,20','51,200','201,500','501,1000','1001,5000','5001,10000','10001,']"),
        q_organization_keyword_tags: z.array(z.string()).optional().describe("Technology or keyword tags"),
        organization_locations: z.array(z.string()).optional().describe("Location filters e.g. ['United States', 'California']"),
        currently_using_any_of_technology_uids: z.array(z.string()).optional().describe("Tech stack UIDs to filter by"),
        page: z.number().int().min(1).optional().default(1),
        per_page: z.number().int().min(1).max(100).optional().default(25),
      },
    },
    async (args) => {
      const { page, per_page, ...filters } = args;
      return asResult(
        await client.request("POST", "/mixed_companies/search", {
          body: { ...filters, page, per_page },
        }),
      );
    },
  );

  server.registerTool(
    "get_organization",
    {
      description: "Fetch a single Apollo organization/account by ID.",
      inputSchema: {
        id: z.string().describe("Apollo organization ID"),
      },
    },
    async ({ id }) => asResult(await client.request("GET", `/accounts/${id}`)),
  );

  server.registerTool(
    "enrich_organization",
    {
      description:
        "Enrich an organization by domain. Returns company data including employee count, revenue, industry, tech stack, and social profiles.",
      inputSchema: {
        domain: z.string().describe("Company domain e.g. 'salesforce.com'"),
      },
    },
    async ({ domain }) =>
      asResult(
        await client.request("POST", "/organizations/enrich", { body: { domain } }),
      ),
  );

  server.registerTool(
    "create_account",
    {
      description: "Create a new account (company) in Apollo.",
      inputSchema: {
        name: z.string(),
        domain: z.string().optional(),
        phone: z.string().optional(),
        linkedin_url: z.string().url().optional(),
        raw_address: z.string().optional(),
        owner_id: z.string().optional().describe("Apollo user ID to assign as account owner"),
        label_names: z.array(z.string()).optional(),
      },
    },
    async (args) =>
      asResult(await client.request("POST", "/accounts", { body: args })),
  );

  server.registerTool(
    "update_account",
    {
      description: "Update an existing Apollo account.",
      inputSchema: {
        id: z.string().describe("Apollo account ID"),
        name: z.string().optional(),
        domain: z.string().optional(),
        phone: z.string().optional(),
        raw_address: z.string().optional(),
        owner_id: z.string().optional(),
        label_names: z.array(z.string()).optional(),
      },
    },
    async ({ id, ...body }) =>
      asResult(await client.request("PUT", `/accounts/${id}`, { body })),
  );
}
