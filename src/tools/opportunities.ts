import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApolloClient } from "../client.js";
import { asResult } from "./_shared.js";

export function registerOpportunityTools(server: McpServer, client: ApolloClient): void {
  server.registerTool(
    "list_opportunities",
    {
      description: "List Apollo opportunities (deals). Returns name, stage, amount, close date, and associated account/contact.",
      inputSchema: {
        account_id: z.string().optional().describe("Filter by Apollo account ID"),
        owner_id: z.string().optional().describe("Filter by owning user ID"),
        stage_id: z.string().optional().describe("Filter by pipeline stage ID"),
        is_closed: z.boolean().optional(),
        is_won: z.boolean().optional(),
        page: z.number().int().min(1).optional().default(1),
        per_page: z.number().int().min(1).max(100).optional().default(25),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/opportunities", { query: args })),
  );

  server.registerTool(
    "create_opportunity",
    {
      description: "Create a new opportunity (deal) in Apollo.",
      inputSchema: {
        name: z.string(),
        amount: z.number().optional(),
        expected_revenue: z.number().optional(),
        close_date: z.string().optional().describe("ISO8601 close date e.g. '2025-12-31'"),
        account_id: z.string().optional(),
        contact_ids: z.array(z.string()).optional(),
        owner_id: z.string().optional(),
        stage_id: z.string().optional(),
      },
    },
    async (args) =>
      asResult(await client.request("POST", "/opportunities", { body: args })),
  );

  server.registerTool(
    "update_opportunity",
    {
      description: "Update an existing Apollo opportunity.",
      inputSchema: {
        id: z.string().describe("Apollo opportunity ID"),
        name: z.string().optional(),
        amount: z.number().optional(),
        close_date: z.string().optional(),
        stage_id: z.string().optional(),
        is_closed: z.boolean().optional(),
        is_won: z.boolean().optional(),
      },
    },
    async ({ id, ...body }) =>
      asResult(await client.request("PUT", `/opportunities/${id}`, { body })),
  );
}
