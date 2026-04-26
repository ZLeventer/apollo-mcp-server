#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ApolloClient } from "./client.js";
import { registerPeopleTools } from "./tools/people.js";
import { registerOrganizationTools } from "./tools/organizations.js";
import { registerSequenceTools } from "./tools/sequences.js";
import { registerOpportunityTools } from "./tools/opportunities.js";

async function main() {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    console.error("APOLLO_API_KEY is not set. Generate one at app.apollo.io → Settings → API.");
    process.exit(1);
  }

  const client = new ApolloClient(apiKey);
  const server = new McpServer({ name: "apollo-mcp-server", version: "1.0.0" });

  registerPeopleTools(server, client);
  registerOrganizationTools(server, client);
  registerSequenceTools(server, client);
  registerOpportunityTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("apollo-mcp-server ready on stdio");
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(1);
});
