import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApolloClient } from "../client.js";
import { asResult } from "./_shared.js";

export function registerSequenceTools(server: McpServer, client: ApolloClient): void {
  server.registerTool(
    "search_sequences",
    {
      description: "Search Apollo email sequences. Returns sequence name, steps, active/paused status, and stats.",
      inputSchema: {
        q_keywords: z.string().optional().describe("Search by sequence name"),
        active: z.boolean().optional().describe("Filter by active status"),
        page: z.number().int().min(1).optional().default(1),
        per_page: z.number().int().min(1).max(100).optional().default(25),
      },
    },
    async (args) =>
      asResult(
        await client.request("POST", "/emailer_campaigns/search", { body: args }),
      ),
  );

  server.registerTool(
    "get_sequence",
    {
      description: "Fetch a single Apollo sequence by ID, including all steps.",
      inputSchema: {
        id: z.string().describe("Apollo sequence (emailer_campaign) ID"),
      },
    },
    async ({ id }) =>
      asResult(await client.request("GET", `/emailer_campaigns/${id}`)),
  );

  server.registerTool(
    "add_contacts_to_sequence",
    {
      description:
        "Add one or more contacts to an Apollo sequence. Contacts will enter the sequence at step 1. Requires the contact IDs and sequence ID.",
      inputSchema: {
        id: z.string().describe("Apollo sequence (emailer_campaign) ID"),
        contact_ids: z.array(z.string()).min(1).max(100).describe("Apollo contact IDs to add"),
        send_email_from_email_account_id: z.string().optional().describe("Email account ID to send from"),
        userId: z.string().optional().describe("Apollo user ID to assign ownership of the sequence enrollment"),
      },
    },
    async ({ id, ...body }) =>
      asResult(
        await client.request("POST", `/emailer_campaigns/${id}/add_contact_ids`, { body }),
      ),
  );

  server.registerTool(
    "remove_contact_from_sequence",
    {
      description: "Remove a contact from all active sequences or a specific one.",
      inputSchema: {
        contact_id: z.string().describe("Apollo contact ID"),
        emailer_campaign_id: z.string().optional().describe("Specific sequence ID — omit to remove from all"),
      },
    },
    async (args) =>
      asResult(
        await client.request("POST", "/emailer_campaign_memberships/remove_from_campaign", {
          body: args,
        }),
      ),
  );

  server.registerTool(
    "list_sequence_memberships",
    {
      description: "List contacts enrolled in a given sequence, with their current step and status.",
      inputSchema: {
        emailer_campaign_id: z.string().describe("Apollo sequence ID"),
        status: z
          .enum(["active", "paused", "finished", "bounced", "opted_out"])
          .optional(),
        page: z.number().int().min(1).optional().default(1),
        per_page: z.number().int().min(1).max(100).optional().default(25),
      },
    },
    async (args) =>
      asResult(
        await client.request("GET", "/emailer_campaign_memberships", { query: args }),
      ),
  );
}
