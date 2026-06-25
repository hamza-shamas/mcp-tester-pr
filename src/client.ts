const BASE_URL = "https://app.pressadvantage.com/api/customers";

async function request(
  method: string,
  path: string,
  apiKey: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${apiKey}`;

  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("Request timed out — PA API unreachable");
    }
    throw err;
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (res.status === 401) throw new Error("Invalid API key");
  if (res.status === 404) throw new Error(`Resource not found (404): ${path}`);
  if (res.status === 422) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as Record<string, unknown>).error)
        : text;
    throw new Error(`Validation error: ${msg}`);
  }
  if (!res.ok) {
    throw new Error(`PA API error ${res.status}: ${text}`);
  }

  return data;
}

export type PaClient = {
  paGet: (path: string) => Promise<unknown>;
  paPost: (path: string, body?: Record<string, unknown>) => Promise<unknown>;
  paPut: (path: string, body?: Record<string, unknown>) => Promise<unknown>;
};

export function createClient(apiKey: string): PaClient {
  return {
    paGet: (path) => request("GET", path, apiKey),
    paPost: (path, body) => request("POST", path, apiKey, body),
    paPut: (path, body) => request("PUT", path, apiKey, body),
  };
}
