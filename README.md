# apollo-mcp-server

MCP server for [Apollo.io](https://www.apollo.io/) — search contacts, enrich companies, manage sequences, and update opportunities through Claude and other MCP clients.

## Tools

| Tool | Description |
|------|-------------|
| `search_people` | Search contacts by name, title, company, seniority, location, or employee size |
| `get_person` | Fetch a single contact by ID |
| `create_contact` | Create a new contact in Apollo |
| `update_contact` | Update an existing contact |
| `enrich_person` | Enrich a person by email, name, or LinkedIn URL |
| `bulk_enrich_people` | Enrich up to 10 people at once |
| `search_organizations` | Search companies by name, industry, size, tech stack, or location |
| `get_organization` | Fetch a single account by ID |
| `enrich_organization` | Enrich a company by domain |
| `create_account` | Create a new account (company) |
| `update_account` | Update an existing account |
| `search_sequences` | Search email sequences by name or status |
| `get_sequence` | Fetch a sequence with all steps |
| `add_contacts_to_sequence` | Enroll contacts in a sequence |
| `remove_contact_from_sequence` | Remove a contact from a sequence |
| `list_sequence_memberships` | List contacts enrolled in a sequence with step/status |
| `list_opportunities` | List deals with stage, amount, and close date |
| `create_opportunity` | Create a new deal |
| `update_opportunity` | Update an existing deal |

## Installation

```bash
npx apollo-mcp-server
```

### Environment variable

| Variable | Description |
|----------|-------------|
| `APOLLO_API_KEY` | Apollo API key — generate at **app.apollo.io → Settings → Integrations → API** |

## Claude Desktop config

```json
{
  "mcpServers": {
    "apollo": {
      "command": "npx",
      "args": ["-y", "apollo-mcp-server"],
      "env": {
        "APOLLO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Links

- [Apollo API Documentation](https://docs.apollo.io/docs/api-overview)
- [Apollo API Reference](https://docs.apollo.io/reference)
