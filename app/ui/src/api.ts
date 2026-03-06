import { URL_API } from "./constants";
import { authHeaders } from "./auth";

function apiUrl(path: string): string {
  const base = URL_API.replace(/\/+$/, "");
  const p = path.replace(/^\//, "");
  return p ? `${base}/${p}` : base;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** GET request with JWT Bearer token for protected endpoints. */
export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new ApiError(`API error: ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

/** POST request with JWT Bearer token. */
export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError((data as { message?: string }).message ?? `API error: ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

/** DELETE request with JWT Bearer token. */
export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(apiUrl(path), {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError((data as { message?: string }).message ?? `API error: ${res.status}`, res.status);
  }
  if (res.status !== 204 && res.headers.get("content-length") !== "0") {
    await res.json().catch(() => {});
  }
}
