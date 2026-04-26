import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApolloClient } from "../client.js";
import { asResult } from "./_shared.js";

export function registerPeopleTools(server: McpServer, client: ApolloClient): void {
  server.registerTool(
    "search_people",
    {
      description:
        "Search Apollo.io people/contacts by name, title, company, location, or seniority. Returns paginated contact records with email, phone, LinkedIn, and company data.",
      inputSchema: {
        q_keywords: z.string().optional().describe("Full-text keyword search across name, title, company"),
        person_titles: z.array(z.string()).optional().describe("Filter by job titles (e.g. ['VP of Sales', 'Director of Marketing'])"),
        person_seniorities: z.array(z.string()).optional().describe("Seniority levels: owner, founder, c_suite, partner, vp, head, director, manager, senior, entry, intern"),
        organization_industry_tag_ids: z.array(z.string()).optional().describe("Industry tag IDs to filter by"),
        organization_num_employees_ranges: z.array(z.string()).optional().describe("Employee count ranges e.g. ['1,10','11,20','51,200']"),
        q_organization_name: z.string().optional().describe("Company name search"),
        contact_email_status: z.array(z.string()).optional().describe("Email statuses: verified, guessed, unavailable, bounced, pending_manual_fulfillment"),
        prospected_by_current_team: z.array(z.string()).optional().describe("Filter by whether prospected: yes, no"),
        page: z.number().int().min(1).optional().default(1),
        per_page: z.number().int().min(1).max(100).optional().default(25),
      },
    },
    async (args) => {
      const { page, per_page, ...filters } = args;
      return asResult(
        await client.request("POST", "/mixed_people/search", {
          body: { ...filters, page, per_page },
        }),
      );
    },
  );

  server.registerTool(
    "get_person",
    {
      description: "Fetch a single Apollo contact by ID.",
      inputSchema: {
        id: z.string().describe("Apollo contact ID"),
      },
    },
    async ({ id }) => asResult(await client.request("GET", `/contacts/${id}`)),
  );

  server.registerTool(
    "create_contact",
    {
      description: "Create a new contact in Apollo.",
      inputSchema: {
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email().optional(),
        title: z.string().optional(),
        organization_name: z.string().optional(),
        phone: z.string().optional(),
        linkedin_url: z.string().url().optional(),
        website_url: z.string().url().optional(),
        account_id: z.string().optional().describe("Apollo account ID to associate with"),
        label_names: z.array(z.string()).optional().describe("Label names to apply to the contact"),
      },
    },
    async (args) =>
      asResult(await client.request("POST", "/contacts", { body: args })),
  );

  server.registerTool(
    "update_contact",
    {
      description: "Update an existing Apollo contact.",
      inputSchema: {
        id: z.string().describe("Apollo contact ID"),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email().optional(),
        title: z.string().optional(),
        organization_name: z.string().optional(),
        phone: z.string().optional(),
        linkedin_url: z.string().url().optional(),
        account_id: z.string().optional(),
        label_names: z.array(z.string()).optional(),
      },
    },
    async ({ id, ...body }) =>
      asResult(await client.request("PUT", `/contacts/${id}`, { body })),
  );

  server.registerTool(
    "enrich_person",
    {
      description:
        "Enrich a person record using email, name, or LinkedIn URL. Returns verified contact data including email, phone, title, and company.",
      inputSchema: {
        email: z.string().email().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        linkedin_url: z.string().url().optional(),
        organization_name: z.string().optional(),
        domain: z.string().optional().describe("Company domain to help match"),
      },
    },
    async (args) =>
      asResult(await client.request("POST", "/people/match", { body: args })),
  );

  server.registerTool(
    "bulk_enrich_people",
    {
      description:
        "Enrich up to 10 people at once. Each item can include email, name, or LinkedIn URL. Returns enriched contact data for each.",
      inputSchema: {
        details: z
          .array(
            z.object({
              email: z.string().email().optional(),
              first_name: z.string().optional(),
              last_name: z.string().optional(),
              organization_name: z.string().optional(),
              domain: z.string().optional(),
              linkedin_url: z.string().url().optional(),
            }),
          )
          .max(10),
        reveal_personal_emails: z.boolean().optional().default(false),
        reveal_phone_number: z.boolean().optional().default(false),
      },
    },
    async (args) =>
      asResult(await client.request("POST", "/people/bulk_match", { body: args })),
  );
}
