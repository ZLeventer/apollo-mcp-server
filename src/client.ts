const BASE_URL = "https://api.apollo.io/api/v1";

export class ApolloError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
    this.name = "ApolloError";
  }
}

export class ApolloClient {
  constructor(private apiKey: string) {
    if (!apiKey) throw new Error("APOLLO_API_KEY is required");
  }

  async request<T = unknown>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    opts: { query?: Record<string, unknown>; body?: Record<string, unknown> } = {},
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);

    if (method === "GET" || method === "DELETE") {
      url.searchParams.set("api_key", this.apiKey);
      if (opts.query) {
        for (const [k, v] of Object.entries(opts.query)) {
          if (v === undefined || v === null) continue;
          url.searchParams.set(k, String(v));
        }
      }
    }

    const bodyPayload =
      method === "POST" || method === "PUT"
        ? { api_key: this.apiKey, ...opts.body }
        : undefined;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      body: bodyPayload ? JSON.stringify(bodyPayload) : undefined,
    });

    const text = await res.text();
    const parsed = text ? safeJson(text) : null;

    if (!res.ok) {
      throw new ApolloError(res.status, parsed, `Apollo ${method} ${path} → ${res.status}`);
    }
    return parsed as T;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
