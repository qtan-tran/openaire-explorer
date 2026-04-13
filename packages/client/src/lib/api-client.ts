const BASE_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ??
  "http://localhost:3001";

// ─── Error ────────────────────────────────────────────────────────────────────

export class APIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

// ─── Response envelopes ───────────────────────────────────────────────────────

export interface PaginatedEnvelope<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalResults: number;
    totalPages: number;
  };
}

export interface SingleEnvelope<T> {
  data: T;
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

type QueryValue = string | number | boolean | undefined | null;

export async function fetchAPI<T>(
  endpoint: string,
  params?: Record<string, QueryValue>
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => ({ error: res.statusText, code: "UNKNOWN" }));
    throw new APIError(
      res.status,
      (body as { error?: string }).error ?? res.statusText,
      (body as { code?: string }).code ?? "UNKNOWN"
    );
  }

  return res.json() as Promise<T>;
}
